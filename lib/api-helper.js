import { auth } from './auth'
import { handleApiError, response } from './utils'

export { handleApiError, response } from './utils'

/**
 * Extracts and calculates page, limit, and skip parameters from searchParams
 */
export function parsePagination(searchParams, defaultLimit = 10) {
    const pageParam = searchParams.get('page')
    const limitParam = searchParams.get('limit')
    const page = Math.max(1, parseInt(pageParam ?? '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(limitParam ?? `${defaultLimit}`, 10)))
    const skip = (page - 1) * limit
    return { page, limit, skip }
}

/**
 * Wrapper for API handlers requiring authentication
 */
export function withAuth(handler) {
    return async (request, context) => {
        const session = await auth()
        if (!session) {
            return response({ error: "Unauthorized" }, 401)
        }
        return handler(request, context, session)
    }
}

/**
 * Wrapper for API handlers requiring ADMIN role
 */
export function withAdmin(handler) {
    return async (request, context) => {
        const session = await auth()
        if (!session || session.user.role !== 'ADMIN') {
            return response({ error: "Forbidden - Admin only" }, 403)
        }
        return handler(request, context, session)
    }
}

/**
 * Validates required fields in the data object
 */
function validateFields(data, requiredFields) {
    if (!data) return response({ error: 'No data provided' }, 400);

    const missing = requiredFields.filter(f => data[f] === undefined || data[f] === null || data[f] === '');

    if (missing.length > 0) {
        return response({ error: `Missing required fields: ${missing.join(', ')}` }, 400);
    }
    return null;
}

/**
 * Helper to get all records for a model
 */
export async function handleGetAll(model, options = {}) {
    try {
        const items = await model.findMany(options)
        return response(items)
    } catch (error) {
        return handleApiError(error)
    }
}


export async function handleGetById(id, model, options = {}, notFoundMessage = 'Resource not found') {
    try {
        const item = await model.findUnique({ where: { id }, ...options })
        if (!item) return response({ error: notFoundMessage }, 404)
        return response(item)
    } catch (error) {
        return handleApiError(error)
    }
}


export async function handlePost(model, options = {}, requiredFields = [], errorMessages = {}) {
    try {
        const validationError = validateFields(options.data, requiredFields);
        if (validationError) return validationError;

        const item = await model.create(options)
        return response(item, 201)
    } catch (error) {
        return handleApiError(error, errorMessages)
    }
}

export async function handleUpsert(model, options = {}, errorMessages = {}) {
    try {
        const item = await model.upsert(options)
        return response(item, 201)
    } catch (error) {
        return handleApiError(error, errorMessages)
    }
}


export async function handleUpdate(id, model, options = {}, requiredFields = [], errorMessages = {}) {
    try {
        if (options.data && requiredFields.length > 0) {
            const validationError = validateFields(options.data, requiredFields);
            if (validationError) return validationError;
        }
        const item = await model.update({ where: { id }, ...options })
        return response(item)
    } catch (error) {
        return handleApiError(error, errorMessages)
    }
}

export async function handleDelete(id, model, constraints = null, errorMessages = {}) {
    try {
        if (constraints) {
            const count = await constraints.model.count({ where: constraints.where })
            if (count > 0) return response({ error: constraints.message }, 400)
        }
        await model.delete({ where: { id } })
        return response({ message: 'Deleted successfully' })
    } catch (error) {
        return handleApiError(error, errorMessages)
    }
}


export function ProductFormat(data) {
    const formatted = { ...data }
    if (formatted.price !== undefined) formatted.price = parseFloat(formatted.price)
    if (formatted.stock !== undefined) {
        formatted.stock = parseInt(formatted.stock)
        if (formatted.stock <= 0) formatted.isAvailable = false
    }
    return formatted
}

export async function OwnershipCheck(id, model, session, options = {}) {
    try {
        if (!session) {
            return { error: response({ error: 'Unauthorized' }, 401) }
        }

        const item = await model.findUnique({
            where: { id },
            ...options
        })

        const isOwner = item?.userId === session?.user?.id
        const isAdmin = session?.user?.role === 'ADMIN'

        if (!item || (!isOwner && !isAdmin)) {
            return { error: response({ error: 'Resource not found' }, 404) }
        }

        return { data: item }
    } catch (error) {
        return { error: handleApiError(error) }
    }
}

