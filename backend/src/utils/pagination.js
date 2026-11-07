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
    const currentPage = Math.max(Number(page) || 1, 1);
    const parsedLimit = Math.max(Number(limit) || 10, 1);
    const total = Math.max(Number(totalItems) || 0, 0);
    const totalPages = Math.ceil(total / parsedLimit) || 1;

    return {
        page: currentPage,
        limit: parsedLimit,
        totalItems: total,
        totalPages,
        hasPrev: currentPage > 1,
        hasNext: currentPage < totalPages
    };
};


export {
    getPagination,
    getPaginationData
};

