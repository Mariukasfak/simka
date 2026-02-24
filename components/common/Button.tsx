"use client";

// Pakeičiame importą į modernų UI Button
import { Button as ButtonComponent } from "../ui/Button";

// Reeksportuojame Button komponentą, kad jis būtų pasiekiamas per '@/components/common/Button' kelią
export const Button = ButtonComponent;
export default Button;
