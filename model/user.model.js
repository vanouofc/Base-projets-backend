import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: [true, "Le nom de l'utilisateur est requis."],
        trim: true,
    },
    prenom: {
        type: String,
        required: [true, "Le prénom de l'utilisateur est requis."],
        trim: true,
    },
    email: {
        type: String,
        required: [true, "L'email de l'utilisateur est requis."],
        unique: true,
        trim: true,
    },
    emailotp: {
        type: String,
        default: null,
        trim: true,
    },
    emailOtpExpires: {
        type: Date,
        default: null,
    },
    emailVerified: {
        type: Boolean,
        default: false,
    },
    password: {
        type: String,
        required: [true, "Le mot de passe de l'utilisateur est requis."],
    },
    phone: {
        type: String,
        required: [true, "Le numéro de téléphone de l'utilisateur est requis."],
        trim: true,
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user',
    },
    a2fEnabled: {
        type: Boolean,
        default: false,
    },
    a2fotp: {
        type: String,
        default: null,
    },
    a2fOtpExpires: {
        type: Date,
        default: null,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    deletedAt: {
        type: Date,
        default: null,
    },
    resetPasswordOtp: {
        type: String,
        default: null,
    },
    resetPasswordOtpExpires: {
        type: Date,
        default: null,
    },
    tokenVersion: {
        type: Number,
        default: 0,
    },
}, {timestamps: true});

userSchema.pre('find', function() {
    this.where({ 
        isActive: true 
    })
});
userSchema.pre('findOne', function() {
    this.where({ 
        isActive: true,
    })
});


userSchema.index({ phone: 1 }, { unique: true });
userSchema.index({ nom: 1});



const User = mongoose.model('User', userSchema);

export default User;