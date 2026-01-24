description: Compare two files and show differences
model: claude-opus-4-5-20251101
argument-hint: [file1] [file2]
allowed-tools: Read, Glob, Grep, Bash

## Compare Two Files

Compare the two files provided in $ARGUMENTS and provide:

1. **Summary**: Brief overview of what each file contains and their purpose
2. **Differences**: Key differences between the files including:
   - Added lines (present in file2 but not file1)
   - Removed lines (present in file1 but not file2)
   - Modified sections
3. **Similarity**: Percentage estimate of how similar the files are
4. **Recommendations**: If applicable, suggest which version to keep or how to merge

If only one file is provided, ask the user for the second file.
If the files are binary or too large, report this instead of comparing content.
