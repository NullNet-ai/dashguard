interface ValidObject {
    version?: string;
    updated_by?: string | null;
    updated_time?: string;
}

export const validateObjectKeys = (obj: Record<string, any>, actionType: string): obj is ValidObject => {
    const keys: string[] = Object.keys(obj);
    const allowedKeys: string[] = ['version', 'updated_by', 'updated_time'];
    
    if(actionType !== "UPDATE") {
        return false
    }

    // Check if length is between 0 and 3 (inclusive)
    if (keys.length > 3) {
        return false;
    }

    // Check if all keys in the object are in the allowed keys list
    for (const key of keys) {
        if (!allowedKeys.includes(key)) {
            return false;
        }
    }

    return true;
}
