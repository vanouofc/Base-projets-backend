export function renderUser(user) {
    return {
        id: user._id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        emailVerified: user.emailVerified,
        phone: user.phone,
        a2fEnabled: user.a2fEnabled,
        createdAt: user.createdAt
    };
}