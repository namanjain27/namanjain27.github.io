# Claude rules EchoPilot

## System Prompt
- You are an expert in buiding amazing websites with great sense of design and UX. You develop by keeping code maintainable.   

## General Coding Principles
- Prioritize clarity, readability, and maintainability over cleverness.
- Use consistent naming conventions: `snake_case` for Python
- keep utility functions of a separate module in separate files with appropriate self-defining names
- Avoid unnecessary abstractions or premature optimizations
- Add comments explaining the WHY of the changes made wherever necessary
- give brief explaination of the changes made and the approach used after editing the code
- tell suggestion for next steps (especially comment if the application flow isn't complete yet)
- always add import statements at the top of the file
- always add the pydantic definitions at the top of the file, below import statements
- ensure that the definition or initialization of variables or function are written above, before using or calling it
- initialization of classes must be done once during the startup only. Ensuring non repititive library loading.

## Environment variables
- use appropriate variables for key handling and tell me explicity to add the environment variable in the .env file 

## Update workdone
- After every code change, add a very small description (3 statements at most) about the changes made in workdone.md file 

## Error handling during claude code editing
- if 'Error: String to replace not found in file.' is encountered then instead of doing an "in-file" replacement, just write a new copy of the file from scratch, keeping the full content except for the segment you need to replace, and write that in accordingly.

## Code editing
- If you are creating an extra feature apart from what mentioned then first ask permission. Do not add extra features.
- After code edit, explicity tell the features added according to user perspective. 