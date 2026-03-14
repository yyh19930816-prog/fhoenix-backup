const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

class PhoenixPerformanceOptimizer {
    constructor() {
        this.metricsFile = path.join(__dirname, 'performance-metrics.json');
        this.cacheDir = path.join(__dirname, '.phoenix-cache');
        this.metrics = this.loadMetrics();
        this.cache = new Map();
        this.initCache();
    }

    // 初始化缓存目录
    initCache() {
        if (!fs.existsSync(this.cacheDir)) {
            fs.mkdirSync(this.cacheDir, { recursive: true });
        }
    }

    // 加载性能指标
    loadMetrics() {
        try {
            if (fs.existsSync(this.metricsFile)) {
                const data = fs.readFileSync(this.metricsFile, 'utf8');
                return JSON.parse(data);
            }
        } catch (error) {
            console.error('加载性能指标失败:', error);
        }

        return {
            startupTime: 0,
            averageResponseTime: 0,
            memoryUsage: { rss: 0, heapUsed: 0, heapTotal: 0 },
            cacheHitRate: 0,
            totalRequests: 0,
            errorRate: 0,
            timestamp: new Date().toISOString()
        };
    }

    // 保存性能指标
    saveMetrics() {
        try {
            fs.writeFileSync(this.metricsFile, JSON.stringify(this.metrics, null, 2));
            return true;
        } catch (error) {
            console.error('保存性能指标失败:', error);
            return false;
        }
    }

    // 性能测量装饰器
    measurePerformance(name) {
        return (target, propertyName, descriptor) => {
            const method = descriptor.value;
            
            descriptor.value = async function(...args) {
                const start = performance.now();
                const startMemory = process.memoryUsage();
                
                try {
                    const result = await method.apply(this, args);
                    const end = performance.now();
                    const endMemory = process.memoryUsage();
                    
                    this.updateMetrics({
                        operation: name,
                        duration: end - start,
                        memoryDelta: endMemory.heapUsed - startMemory.heapUsed,
                        success: true
                    });
                    
                    return result;
                } catch (error) {
                    const end = performance.now();
                    this.updateMetrics({
                        operation: name,
                        duration: end - start,
                        success: false,
                        error: error.message
                    });
                    throw error;
                }
            };
            
            return descriptor;
        };
    }

    // 更新性能指标
    updateMetrics(metric) {
        this.metrics.totalRequests++;
        
        // 计算平均响应时间
        if (metric.success) {
            const oldAvg = this.metrics.averageResponseTime;
            const newAvg = oldAvg + (metric.duration - oldAvg) / this.metrics.totalRequests;
            this.metrics.averageResponseTime = newAvg;
        }
        
        // 计算错误率
        if (!metric.success) {
            this.metrics.errorRate = (this.metrics.errorRate || 0) + 1 / this.metrics.totalRequests;
        }
        
        // 更新内存使用
        const currentMemory = process.memoryUsage();
        this.metrics.memoryUsage = currentMemory;
        
        this.metrics.timestamp = new Date().toISOString();
        this.saveMetrics();
    }

    // 内存缓存系统
    setCache(key, value, ttl = 300000) { // 默认5分钟
        const cacheEntry = {
            value: value,
            expiresAt: Date.now() + ttl,
            size: JSON.stringify(value).length
        };
        
        this.cache.set(key, cacheEntry);
        
        // 定期清理过期缓存
        this.cleanExpiredCache();
        
        return true;
    }

    getCache(key) {
        const entry = this.cache.get(key);
        
        if (!entry) {
            this.metrics.cacheHitRate = (this.metrics.cacheHitRate || 0) + 0; // 未命中
            return null;
        }
        
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            this.metrics.cacheHitRate = (this.metrics.cacheHitRate || 0) + 0; // 过期
            return null;
        }
        
        this.metrics.cacheHitRate = (this.metrics.cacheHitRate || 0) + 1; // 命中
        return entry.value;
    }

    // 清理过期缓存
    cleanExpiredCache() {
        const now = Date.now();
        let cleaned = 0;
        
        for (const [key, entry] of this.cache.entries()) {
            if (now > entry.expiresAt) {
                this.cache.delete(key);
                cleaned++;
            }
        }
        
        if (cleaned > 0) {
            console.log(`清理了 ${cleaned} 个过期缓存项`);
        }
        
        return cleaned;
    }

    // 文件缓存（磁盘缓存）
    async setFileCache(key, data) {
        const cacheFile = path.join(this.cacheDir, `${key}.json`);
        const cacheEntry = {
            data: data,
            timestamp: Date.now(),
            size: JSON.stringify(data).length
        };
        
        try {
            fs.writeFileSync(cacheFile, JSON.stringify(cacheEntry));
            return true;
        } catch (error) {
            console.error('文件缓存失败:', error);
            return false;
        }
    }

    async getFileCache(key) {
        const cacheFile = path.join(this.cacheDir, `${key}.json`);
        
        try {
            if (fs.existsSync(cacheFile)) {
                const data = fs.readFileSync(cacheFile, 'utf8');
                const entry = JSON.parse(data);
                
                // 检查是否过期（1小时）
                if (Date.now() - entry.timestamp < 3600000) {
                    return entry.data;
                } else {
                    fs.unlinkSync(cacheFile); // 删除过期文件
                }
            }
        } catch (error) {
            console.error('读取文件缓存失败:', error);
        }
        
        return null;
    }

    // 内存使用分析
    analyzeMemoryUsage() {
        const memory = process.memoryUsage();
        const stats = {
            rss: this.formatBytes(memory.rss),
            heapTotal: this.formatBytes(memory.heapTotal),
            heapUsed: this.formatBytes(memory.heapUsed),
            external: this.formatBytes(memory.external),
            cacheSize: this.formatBytes(this.getCacheSize())
        };
        
        console.log('内存使用分析:');
        console.table(stats);
        
        return stats;
    }

    // 获取缓存总大小
    getCacheSize() {
        let totalSize = 0;
        for (const entry of this.cache.values()) {
            totalSize += entry.size;
        }
        return totalSize;
    }

    // 字节格式化
    formatBytes(bytes) {
        const sizes = ['B', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 B';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }

    // 性能测试
    async performanceTest(iterations = 100) {
        console.log(`开始性能测试 (${iterations} 次迭代)...`);
        
        const results = {
            cacheOperations: 0,
            fileOperations: 0,
            memoryOperations: 0,
            averageTime: 0
        };
        
        const startTime = performance.now();
        
        for (let i = 0; i < iterations; i++) {
            // 缓存操作测试
            this.setCache(`test_${i}`, { data: 'performance test', iteration: i });
            this.getCache(`test_${i}`);
            results.cacheOperations += 2;
            
            // 文件操作测试（每10次迭代执行一次）
            if (i % 10 === 0) {
                await this.setFileCache(`file_test_${i}`, { test: 'file cache' });
                await this.getFileCache(`file_test_${i}`);
                results.fileOperations += 2;
            }
        }
        
        const endTime = performance.now();
        results.averageTime = (endTime - startTime) / iterations;
        
        console.log('性能测试结果:');
        console.table(results);
        
        return results;
    }

    // 生成性能报告
    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: this.analyzeMemoryUsage(),
            metrics: this.metrics,
            cacheStats: {
                size: this.cache.size,
                totalSize: this.formatBytes(this.getCacheSize()),
                hitRate: this.metrics.cacheHitRate
            }
        };
        
        console.log('=== 性能优化报告 ===');
        console.log(JSON.stringify(report, null, 2));
        
        return report;
    }
}

// 测试性能优化器
async function testPerformanceOptimizer() {
    console.log('=== 凤凰性能优化器测试 ===');
    
    const optimizer = new PhoenixPerformanceOptimizer();
    
    console.log('1. 初始内存分析:');
    optimizer.analyzeMemoryUsage();
    
    console.log('2. 缓存系统测试...');
    optimizer.setCache('user_preferences', { theme: 'dark', language: 'zh-CN' });
    const cachedPrefs = optimizer.getCache('user_preferences');
    console.log('缓存读取:', cachedPrefs);
    
    console.log('3. 文件缓存测试...');
    await optimizer.setFileCache('system_config', { version: '1.0.0', modules: 4 });
    const fileCache = await optimizer.getFileCache('system_config');
    console.log('文件缓存读取:', fileCache);
    
    console.log('4. 性能测试...');
    await optimizer.performanceTest(50);
    
    console.log('5. 最终性能报告:');
    optimizer.generateReport();
    
    console.log('=== 性能优化测试完成 ===');
    
    return optimizer;
}

// 如果直接运行则执行测试
if (require.main === module) {
    testPerformanceOptimizer();
}

module.exports = PhoenixPerformanceOptimizer;