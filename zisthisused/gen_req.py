import pkg_resources
import subprocess

def generate_requirements():
    # Get all installed packages
    installed_packages = [dist.project_name + "==" + dist.version
        for dist in pkg_resources.working_set]
    
    # Write to requirements.txt
    with open('requirements.txt', 'w') as f:
        for package in sorted(installed_packages):
            f.write(package + '\n')

    print("Generated requirements.txt successfully!")

if __name__ == "__main__":
    # First, ensure pip is up to date
    subprocess.check_call(["python", "-m", "pip", "install", "--upgrade", "pip"])
    generate_requirements()