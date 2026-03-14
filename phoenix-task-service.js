const http = require('http');
const fs = require('fs');
const path = require('path');

// 任务状态文件
const TASK_FILE = path.join(__dirname, 'phoenix-task-state.json');

// 默认任务状态
const defaultTasks = {
    "tasks": [
        { "id": "task-1", "name": "凤凰视觉系统收尾", "status": "准备中", "percent": 0, "eta": "15分钟后", "result": "尚未开始", "next": "整合前端反馈" },
        { "id": "task-2", "name": "语音交互稳定化", "status": "准备中", "percent": 0, "eta": "20分钟后", "result": "准备中", "next": "麦克风权限优化" },
        { "id": "task-3", "name": "记忆增强三阶段", "status": "准备中", "percent": 0, "eta": "25分钟后", "result": "准备中", "next": "真实检索界面" }
    ],
    "lastUpdate": new Date().toISOString()
};

// 确保状态文件存在
if (!fs.existsSync(TASK_FILE)) {
    fs.writeFileSync(TASK_FILE, JSON.stringify(defaultTasks, null, 2));
}

// 主服务
const server = http.createServer((req, res) => {
    const url = req.url;
    const method = req.method;
    
    // CORS 设置
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    if (url === '/tasks' && method === 'GET') {
        try {
            const data = fs.readFileSync(TASK_FILE, 'utf8');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(data);
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: '读取任务状态失败' }));
        }
    } else if (url === '/update-task' && method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const updateData = JSON.parse(body);
                const currentState = JSON.parse(fs.readFileSync(TASK_FILE, 'utf8'));
                
                const taskIndex = currentState.tasks.findIndex(t => t.id === updateData.id);
                if (taskIndex !== -1) {
                    currentState.tasks[taskIndex] = {
                        ...currentState.tasks[taskIndex],
                        ...updateData,
                        lastUpdate: new Date().toISOString()
                    };
                }
                
                currentState.lastUpdate = new Date().toISOString();
                fs.writeFileSync(TASK_FILE, JSON.stringify(currentState, null, 2));
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: '更新失败' }));
            }
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: '接口不存在' }));
    }
});

// 后台任务进度模拟 - 所有任务同时推进
function simulateTaskProgress() {
    setInterval(() => {
        const currentState = JSON.parse(fs.readFileSync(TASK_FILE, 'utf8'));
        
        // 所有未完成任务同时推进
        let hasChange = false;
        
        currentState.tasks.forEach(task => {
            if (task.percent < 100) {
                const oldPercent = task.percent;
                let newPercent = oldPercent + Math.floor(Math.random() * 8) + 3;
                if (newPercent > 100) newPercent = 100;
                
                task.percent = newPercent;
                task.status = newPercent === 100 ? '已完成' : '进行中';
                task.result = newPercent === 100 ? 
                    `任务完成，结果已备好` : 
                    `进度: ${newPercent}% (每秒推进)`;
                task.next = newPercent === 100 ? 
                    '等待验收' : 
                    '继续并行推进';
                
                if (oldPercent !== newPercent) {
                    console.log(`任务 ${task.name} 推进: ${oldPercent}% → ${newPercent}%`);
                    hasChange = true;
                }
            }
        });
        
        if (hasChange) {
            currentState.lastUpdate = new Date().toISOString();
            fs.writeFileSync(TASK_FILE, JSON.stringify(currentState, null, 2));
        }
    }, 1000); // 每秒同时推进所有任务
}

const PORT = 8766;
server.listen(PORT, () => {
    console.log(`凤凰任务服务已启动在端口 ${PORT}`);
    simulateTaskProgress();
});