/**
 * Simple gamification utilities
 */

export const MATH_XP = 15;
export const LAW_XP = 50;
export const LEVEL_XP = 500;

export function addXP(currentXP: number, amount: number) {
	const newXP = currentXP + amount;
	const oldLevel = Math.floor(currentXP / LEVEL_XP);
	const newLevel = Math.floor(newXP / LEVEL_XP);
	const leveled = newLevel > oldLevel ? newLevel - oldLevel : 0;
	return { xp: newXP, leveled };
}

export function xpToNextLevel(xp: number) {
	return LEVEL_XP - (xp % LEVEL_XP);
}

export function currentLevel(xp: number) {
	return Math.floor(xp / LEVEL_XP);
}
