import subprocess
import os

def test_all():
    print("Verifying Compilers and Runtimes for Code Nexus:")

    # 1. Python
    py_out = subprocess.check_output(['python3', '-c', 'print("Python 3 execution verified: 42")']).decode().strip()
    print("•", py_out)

    # 2. C
    c_code = '#include <stdio.h>\nint main() { printf("GCC C execution verified: 100\\n"); return 0; }\n'
    with open('/tmp/test_c.c', 'w') as f:
        f.write(c_code)
    subprocess.check_call(['gcc', '-O2', '/tmp/test_c.c', '-o', '/tmp/test_c_bin'])
    c_out = subprocess.check_output(['/tmp/test_c_bin']).decode().strip()
    print("•", c_out)

    # 3. C++
    cpp_code = '#include <iostream>\nint main() { std::cout << "G++ C++17 execution verified: 200" << std::endl; return 0; }\n'
    with open('/tmp/test_cpp.cpp', 'w') as f:
        f.write(cpp_code)
    subprocess.check_call(['g++', '-O2', '-std=c++17', '/tmp/test_cpp.cpp', '-o', '/tmp/test_cpp_bin'])
    cpp_out = subprocess.check_output(['/tmp/test_cpp_bin']).decode().strip()
    print("•", cpp_out)

    # 4. Java
    java_code = 'public class TestMain { public static void main(String[] args) { System.out.println("Java OpenJDK execution verified: 300"); } }\n'
    with open('/tmp/TestMain.java', 'w') as f:
        f.write(java_code)
    subprocess.check_call(['javac', '/tmp/TestMain.java'])
    java_out = subprocess.check_output(['java', '-cp', '/tmp', 'TestMain']).decode().strip()
    print("•", java_out)

    # 5. Node.js
    node_out = subprocess.check_output(['node', '-e', 'console.log("Node.js JS execution verified: 400")']).decode().strip()
    print("•", node_out)

    # 6. SQLite
    sql_out = subprocess.check_output(['sqlite3', ':memory:', 'SELECT "SQLite3 SQL execution verified: 500";']).decode().strip()
    print("•", sql_out)

    print("\n✅ All 6 language runtimes verified and operational for sandbox code execution!")

if __name__ == '__main__':
    test_all()
