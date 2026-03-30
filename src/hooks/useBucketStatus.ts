export const bucketStatus = (value: string, success: string | null) => {
    if (value === "succes") {
        return success
    } else {
        return null
    }
}
