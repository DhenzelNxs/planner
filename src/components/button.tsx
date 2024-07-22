import React, { createContext, useContext } from "react";
import { Text, TouchableOpacity, TouchableOpacityProps, TextProps, ActivityIndicator } from "react-native";
import tw from "tailwind-react-native-classnames";
import clsx from "clsx";
import 'tailwindcss/tailwind.css';


type Variants = "primary" | "secondary"

type ButtonProps = TouchableOpacityProps & {
    variant?: Variants
    isLoading?: boolean,
}

const ThemeContext = createContext<{variant?: Variants}>({})

function Button({
    variant = "primary", 
    children,
    isLoading, 
    style,
    ...rest
}: ButtonProps) {
    return (
        <TouchableOpacity
            style={tw.style(
                "h-11 flex-row items-center justify-center rounded-lg px-2", 
                variant === 'primary' ? "bg-green-300" : "bg-gray-800",
                style
            )}
            disabled={isLoading}
            activeOpacity={0.7}
            {...rest}
        >
            <ThemeContext.Provider value={{variant}}>
                {isLoading ? <ActivityIndicator className="text-lime-950"/> : children}
            </ThemeContext.Provider>
        </TouchableOpacity>
    )
}

function Title({ children, ...rest }: TextProps) {
    const {variant} = useContext(ThemeContext);
    return <Text className={clsx(
        "text-base font-semibold",
        {
            "text-zinc-800": variant === "primary",
            "text-zinc-200": variant === "secondary"
        }
    )}
    {...rest}
        >
            {children}
        </Text>
}

Button.Title = Title

export { Button }