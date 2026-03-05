@echo off
:: 设置代码页为 UTF-8，防止中文乱码
chcp 65001 >nul
setlocal enabledelayedexpansion

:: 设置输出文件名
set "outputFile=all_merged_javascript.txt"

:: 如果旧的合并文件已存在，先删除它
if exist "%outputFile%" del "%outputFile%"

echo 正在搜索并合并所有 .js 文件...

:: 遍历当前目录及子目录下所有的 .js 文件
for /r %%i in (*.js) do (
    :: 确保不合并输出文件本身（虽然输出是 .txt，但这是个好习惯）
    if /i "%%i" neq "%cd%\%outputFile%" (
        
        echo 正在处理: %%~nxi
        
        :: 获取相对路径
        set "fullPath=%%i"
        set "relPath=!fullPath:%cd%\=!"
        
        :: 写入文件信息头
        echo /************************************************ >> "%outputFile%"
        echo  * 文件名: %%~nxi >> "%outputFile%"
        echo  * 相对路径: !relPath! >> "%outputFile%"
        echo  ************************************************/ >> "%outputFile%"
        
        :: 合并 JS 内容
        type "%%i" >> "%outputFile%"
        
        :: 添加换行符
        echo. >> "%outputFile%"
        echo. >> "%outputFile%"
    )
)

echo.
echo ==================================================
echo 合并完成！
echo 结果保存至: %outputFile%
echo ==================================================
pause