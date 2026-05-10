import { hash, compare } from 'bcryptjs';

const SALT_ROUNDS = 10;

export const hashPassword = async (password: string): Promise<string> => {
    const hashedPassword = await hash(password, SALT_ROUNDS);
    return hashedPassword;
};

export const comparePassword = async (
    password: string,
    hash: string
) : Promise<boolean> => {
        const isMatch = await compare(password, hash);
        return isMatch
}