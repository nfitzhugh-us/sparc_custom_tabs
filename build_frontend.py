import os


path = os.path.join("sparc_custom_tabs", "frontend")
if os.path.exists(path):
        print(f"Preparing {path}")
        os.system(f"cd {path} && npm i && npm run build")