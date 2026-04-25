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
        if (name) updateData.name = name;
        if (image !== undefined) updateData.image = image;

        // Password update logic
        if (newPassword) {
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
