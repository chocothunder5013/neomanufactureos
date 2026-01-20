import os

# --- Configuration ---
OUTPUT_FILE = 'project_context.txt'

# Folders to skip entirely
IGNORE_DIRS = {
    'node_modules', 
    '.git', 
    '.next', 
    'dist', 
    'build', 
    '.vscode', 
    'public' # Usually images/svgs, typically not needed for logic context
}

# Specific files to skip (bloat or auto-generated)
IGNORE_FILES = {
    'package-lock.json', 
    'yarn.lock', 
    'pnpm-lock.yaml', 
    'next-env.d.ts', 
    '.DS_Store', 
    'migration_lock.toml',
    'favicon.ico'
}

# Only include files with these extensions
ALLOWED_EXTENSIONS = {
    '.ts', '.tsx', '.js', '.mjs', '.json', 
    '.prisma', '.sql', '.css', '.md'
}

def is_useful_file(filename):
    """Checks if a file is useful based on name and extension."""
    if filename in IGNORE_FILES:
        return False
    
    _, ext = os.path.splitext(filename)
    return ext.lower() in ALLOWED_EXTENSIONS

def main():
    print(f"Starting scrape... Output will be saved to: {OUTPUT_FILE}")
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as outfile:
        # Add a header explaining the file
        outfile.write("PROJECT CONTEXT DUMP\n")
        outfile.write("====================\n\n")

        # Walk through the directory tree
        for root, dirs, files in os.walk('.'):
            # Modify dirs in-place to skip ignored directories so we don't even enter them
            dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]

            for file in files:
                if is_useful_file(file):
                    file_path = os.path.join(root, file)
                    rel_path = os.path.relpath(file_path, '.')
                    
                    try:
                        with open(file_path, 'r', encoding='utf-8') as f:
                            content = f.read()
                        
                        # Write file path header
                        outfile.write(f"--- START OF FILE: {rel_path} ---\n")
                        # Write content
                        outfile.write(content)
                        # Write footer
                        outfile.write(f"\n--- END OF FILE: {rel_path} ---\n\n")
                        
                        print(f"Scraped: {rel_path}")
                        
                    except Exception as e:
                        print(f"Error reading {rel_path}: {e}")

    print(f"\nSuccess! All useful info is in '{OUTPUT_FILE}'.")

if __name__ == "__main__":
    main()
