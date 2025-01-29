export function toCapitalize(str: string) {
    return str
        .split(/[_\s]+/) // Split by underscores or spaces
        .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
        .join(' '); // Join words with a space
}

// Function to convert a string literal type to Pascal Case
export function toPascalCase<T extends string>(str: T): Capitalize<T> {
    // Convert to Pascal Case by capitalizing each word and removing spaces and underscores
    return str
        .replace(/(?:^\w|[A-Z]|\b\w)/g, (match) => match.toUpperCase()) // Capitalize first letter of each word
        .replace(/\s+/g, '') // Remove spaces
        .replace(/_/g, '') // Remove underscores (optional)
        .trim() as Capitalize<T>; // Ensure the return type is Capitalize<T>
}
