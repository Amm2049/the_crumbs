import { handleApiError, response } from './utils'

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