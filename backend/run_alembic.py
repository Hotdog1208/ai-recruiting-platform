import subprocess
try:
    output = subprocess.check_output(['alembic', 'upgrade', 'head'], stderr=subprocess.STDOUT)
    print(output.decode('utf-8'))
except subprocess.CalledProcessError as e:
    print("FAILED WITH ERROR:")
    print(e.output.decode('utf-8'))
