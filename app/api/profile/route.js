import db from "@/lib/db";
import { auth } from "@/lib/auth";
import { handleApiError, response } from "@/lib/api-helper";
import bcrypt from "bcryptjs";

export async function PATCH(request) {
    const session = await auth();
    if (!session) {
        return response({ error: "Unauthorized" }, 401);
    }

    try {
        const body = await request.json();
        const { name, image, currentPassword, newPassword } = body;

        if (!session?.user?.id) {
            return response({ error: "User ID missing from session" }, 400);
        }

        const user = await db.user.findUnique({
            where: { id: session.user.id }
        });

        if (!user) {
            return response({ error: "User not found" }, 404);
        }

        const updateData = {};
        
        // Validate name (#22)
        if (name !== undefined) {
            const trimmedName = name.trim();
            if (!trimmedName) {
                return response({ error: "Name cannot be empty" }, 400);
            }
            updateData.name = trimmedName;
        }
        
        // Sanitize image URL (#23)
        if (image !== undefined) {
            if (image !== null && image !== "") {
                const isSafe = /^https?:\/\//.test(image) || /^\//.test(image) || /^[a-zA-Z0-9_-]+$/.test(image);
                if (!isSafe) {
                    return response({ error: "Invalid image URL" }, 400);
                }
            }
            updateData.image = image;
        }

        // Password update logic (#21)
        if (newPassword) {
            if (!user.password) {
                return response({ error: "Google OAuth accounts cannot change passwords here" }, 400);
            }
            if (!currentPassword) {
                return response({ error: "Current password is required to set a new one" }, 400);
            }

            const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isPasswordValid) {
                return response({ error: "Incorrect current password" }, 400);
            }

            if (newPassword.length < 8) {
                return response({ error: "New password must be at least 8 characters" }, 400);
            }

            updateData.password = await bcrypt.hash(newPassword, 10);
        }

        const updatedUser = await db.user.update({
            where: { id: session.user.id },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true,
            }
        });

        return response(updatedUser);
    } catch (error) {
        return handleApiError(error);
    }
}
