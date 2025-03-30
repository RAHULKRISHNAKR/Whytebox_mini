# This is a compatibility script that redirects to xai.py
import os
import sys
# Get the directory of this script
script_dir = os.path.dirname(os.path.abspath(__file__))
# Path to the real script
target_script = os.path.join(script_dir, 'xai.py')
# Forward all arguments
try:
    os.execv(sys.executable, [sys.executable, target_script] + sys.argv[1:])
except Exception as e:
    print(f"Error executing target script {target_script}: {e}")
    sys.exit(1)
