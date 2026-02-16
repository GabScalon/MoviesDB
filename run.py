import subprocess
import os
import sys
import time


BASE_DIR = os.getcwd()
BACKEND_DIR = os.path.join(BASE_DIR, 'backend')
FRONTEND_DIR = os.path.join(BASE_DIR, 'frontend')

def run_project():
    print("Iniciando MoviesDB")

    if os.name == 'nt': # Windows
        venv_python = os.path.join(BACKEND_DIR, '.venv', 'Scripts', 'python.exe')
    else: # Mac/Linux
        venv_python = os.path.join(BACKEND_DIR, '.venv', 'bin', 'python')

    # Verifica se o arquivo existe. Se não existir, usa o global
    if not os.path.exists(venv_python):
        print(f"⚠️ Aviso: Não achei o venv em {venv_python}. Tentando python global...")
        venv_python = 'python' 

    print(f"Ligando o Backend usando: {venv_python}")
    
    backend_process = subprocess.Popen(
        [venv_python, 'app.py'],
        cwd=BACKEND_DIR, 
        shell=True
    )

    # Pequena pausa para garantir que o Flask comece a subir
    time.sleep(2)


    # 'npm.cmd' é para Windows. Se for Linux/Mac, é apenas 'npm'
    npm_command = 'npm.cmd' if os.name == 'nt' else 'npm'
    
    frontend_process = subprocess.Popen(
        [npm_command, 'run', 'dev'], 
        cwd=FRONTEND_DIR, 
        shell=True
    )

    print("Backend rodando em http://localhost:5000 e Frontend rodando em http://localhost:5173")
    print("Pressione Ctrl+C neste terminal para parar tudo.")

    try:

        backend_process.wait()
        frontend_process.wait()
    except KeyboardInterrupt:
        print("Parando os serviços...")
        backend_process.terminate()
        frontend_process.terminate()

if __name__ == '__main__':
    run_project()