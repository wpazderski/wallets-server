export class ArrayUtils {
    
    static omitDuplicates<T>(arr: T[]): T[] {
        return [...new Set(arr)];
    }
    
}
