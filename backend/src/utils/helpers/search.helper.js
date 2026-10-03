// Creates a case-insensitive search condition
// for the provided fields.

const createSearchQuery = (search, fields = []) => {

    if (!search || !fields.length) {
        return {};
    }

    return {
        $or: fields.map((field) => ({
            [field]: {
                $regex: search,
                $options: "i"
            }
        }))
    };
};


export default createSearchQuery;