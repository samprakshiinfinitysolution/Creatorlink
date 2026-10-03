// Creates standard pagination values from query parameters.

const getPagination = (page = 1, limit = 10) => {
    const currentPage = Math.max(Number(page) || 1, 1);
    const itemsPerPage = Math.min(
        Math.max(Number(limit) || 10, 1),
        100
    );

    const skip = (currentPage - 1) * itemsPerPage;

    return {
        page: currentPage,
        limit: itemsPerPage,
        skip
    };
};


// Creates standard pagination information for the response.

const getPaginationData = (page, limit, totalItems) => {
    return {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit)
    };
};


export {
    getPagination,
    getPaginationData
};

