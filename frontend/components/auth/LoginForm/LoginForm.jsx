"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { login } from "@/redux/auth/auth_slice";


const LoginForm = () => {

    const dispatch = useDispatch();

    const {
        loading,
        error
    } = useSelector((state) => state.auth);


    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });


    const handleChange = (event) => {

        const {
            name,
            value
        } = event.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]: value
        }));
    };


    const handleSubmit = async (event) => {

        event.preventDefault();

        const result = await dispatch(
            login(formData)
        );

        if (login.fulfilled.match(result)) {

            console.log(
                "Login successful",
                result.payload
            );

            // Later:
            // redirect according to user role.
        }
    };


    return (
        <form
            onSubmit={handleSubmit}
            className="w-full max-w-md space-y-5"
        >

            <div>

                <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium"
                >
                    Email
                </label>

                <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="
                        w-full rounded-lg border
                        border-gray-300 bg-white px-4 py-3
                        text-gray-900
                        dark:border-gray-700
                        dark:bg-gray-900
                        dark:text-white
                    "
                />

            </div>


            <div>

                <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium"
                >
                    Password
                </label>

                <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="
                        w-full rounded-lg border
                        border-gray-300 bg-white px-4 py-3
                        text-gray-900
                        dark:border-gray-700
                        dark:bg-gray-900
                        dark:text-white
                    "
                />

            </div>


            {error && (
                <p className="text-sm text-red-500">
                    {error}
                </p>
            )}


            <button
                type="submit"
                disabled={loading}
                className="
                    w-full rounded-lg
                    bg-gray-900 px-4 py-3
                    font-medium text-white
                    hover:bg-gray-800
                    disabled:opacity-50
                    dark:bg-white
                    dark:text-gray-900
                "
            >
                {loading
                    ? "Logging in..."
                    : "Login"
                }
            </button>

        </form>
    );
};


export default LoginForm;