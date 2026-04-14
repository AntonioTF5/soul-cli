export interface ValidationError {
    field: string;
    message: string;
}
export interface ValidationResult {
    pass: boolean;
    file: string;
    name?: string;
    version?: string;
    errors: ValidationError[];
    data?: Record<string, unknown>;
}
/** Parse YAML frontmatter between --- delimiters, skipping leading HTML comments */
export declare function parseFrontmatter(content: string): string;
export declare function validateFile(filePath: string): ValidationResult;
