const fs = require('fs');
const path = require('path');

class MemorySearchEngine {
    constructor(memoryRoot = '/Users/guohao/.openclaw/workspace/memory') {
        this.memoryRoot = memoryRoot;
        this.index = new Map();
        this.lastIndexTime = 0;
        this.indexRefreshInterval = 60000; // 1分钟刷新一次
    }

    // 构建内存索引
    async buildIndex() {
        console.log('开始构建记忆索引...');
        this.index.clear();
        
        const files = this.getAllMemoryFiles();
        let indexedCount = 0;
        
        for (const file of files) {
            try {
                const content = fs.readFileSync(file, 'utf8');
                const keywords = this.extractKeywords(content);
                const metadata = this.extractMetadata(file, content);
                
                this.index.set(file, {
                    path: file,
                    keywords,
                    metadata,
                    content: content.substring(0, 500), // 只存储部分内容用于预览
                    size: content.length,
                    modified: fs.statSync(file).mtime
                });
                
                indexedCount++;
                if (indexedCount % 10 === 0) {
                    console.log(`已索引 ${indexedCount}/${files.length} 个文件`);
                }
            } catch (error) {
                console.warn(`索引文件失败: ${file}`, error.message);
            }
        }
        
        this.lastIndexTime = Date.now();
        console.log(`记忆索引构建完成，共索引 ${indexedCount} 个文件`);
        return this.index;
    }

    // 获取所有记忆文件
    getAllMemoryFiles() {
        const files = [];
        
        function scanDirectory(dir) {
            try {
                const items = fs.readdirSync(dir);
                
                for (const item of items) {
                    const fullPath = path.join(dir, item);
                    const stat = fs.statSync(fullPath);
                    
                    if (stat.isDirectory()) {
                        scanDirectory(fullPath);
                    } else if (stat.isFile() && (item.endsWith('.md') || item.endsWith('.json'))) {
                        files.push(fullPath);
                    }
                }
            } catch (error) {
                console.warn(`扫描目录失败: ${dir}`, error.message);
            }
        }
        
        scanDirectory(this.memoryRoot);
        return files;
    }

    // 提取关键词
    extractKeywords(content) {
        // 简单的关键词提取逻辑
        const words = content
            .toLowerCase()
            .replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 1);
        
        const wordCount = {};
        words.forEach(word => {
            wordCount[word] = (wordCount[word] || 0) + 1;
        });
        
        return Object.entries(wordCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 20)
            .map(([word]) => word);
    }

    // 提取元数据
    extractMetadata(filePath, content) {
        const relativePath = path.relative(this.memoryRoot, filePath);
        const fileName = path.basename(filePath, path.extname(filePath));
        
        return {
            category: this.getCategoryFromPath(filePath),
            fileName,
            relativePath,
            firstLine: content.split('\n')[0] || '',
            wordCount: content.split(/\s+/).length,
            lineCount: content.split('\n').length
        };
    }

    // 根据路径获取分类
    getCategoryFromPath(filePath) {
        const relativePath = path.relative(this.memoryRoot, filePath);
        const firstDir = relativePath.split(path.sep)[0];
        
        if (firstDir === 'daily') return 'daily';
        if (firstDir === 'people') return 'people';
        if (firstDir === 'topics') return 'topics';
        if (firstDir === 'decisions') return 'decisions';
        if (firstDir === 'knowledge') return 'knowledge';
        return 'other';
    }

    // 搜索记忆
    async search(query, options = {}) {
        // 确保索引是最新的
        if (Date.now() - this.lastIndexTime > this.indexRefreshInterval) {
            await this.buildIndex();
        }
        
        const results = [];
        const queryLower = query.toLowerCase();
        
        for (const [filePath, fileData] of this.index.entries()) {
            let score = 0;
            
            // 文件名匹配
            if (fileData.metadata.fileName.toLowerCase().includes(queryLower)) {
                score += 50;
            }
            
            // 路径匹配
            if (fileData.metadata.relativePath.toLowerCase().includes(queryLower)) {
                score += 30;
            }
            
            // 内容匹配
            if (fileData.content.toLowerCase().includes(queryLower)) {
                score += 20;
            }
            
            // 关键词匹配
            const keywordMatches = fileData.keywords.filter(kw => 
                kw.toLowerCase().includes(queryLower)
            ).length;
            score += keywordMatches * 10;
            
            if (score > 0) {
                results.push({
                    filePath,
                    score,
                    ...fileData,
                    snippet: this.generateSnippet(fileData.content, queryLower)
                });
            }
        }
        
        // 按分数排序
        return results.sort((a, b) => b.score - a.score);
    }

    // 生成内容摘要
    generateSnippet(content, query) {
        const index = content.toLowerCase().indexOf(query);
        if (index === -1) {
            return content.substring(0, 200) + '...';
        }
        
        const start = Math.max(0, index - 100);
        const end = Math.min(content.length, index + 100);
        
        return content.substring(start, end) + '...';
    }

    // 获取记忆统计信息
    getStats() {
        const stats = {
            totalFiles: this.index.size,
            categories: {},
            totalSize: 0,
            lastIndexTime: this.lastIndexTime
        };
        
        for (const fileData of this.index.values()) {
            const category = fileData.metadata.category;
            stats.categories[category] = (stats.categories[category] || 0) + 1;
            stats.totalSize += fileData.size;
        }
        
        return stats;
    }
}

module.exports = MemorySearchEngine;

// 测试代码
if (require.main === module) {
    const searchEngine = new MemorySearchEngine();
    
    searchEngine.buildIndex().then(() => {
        console.log('索引统计:', searchEngine.getStats());
        
        // 测试搜索
        searchEngine.search('凤凰').then(results => {
            console.log(`搜索"凤凰"找到 ${results.length} 个结果:`);
            results.slice(0, 5).forEach((result, i) => {
                console.log(`${i+1}. ${result.metadata.fileName} (分数: ${result.score})`);
                console.log(`   路径: ${result.metadata.relativePath}`);
                console.log(`   摘要: ${result.snippet}`);
                console.log('');
            });
        });
    });
}