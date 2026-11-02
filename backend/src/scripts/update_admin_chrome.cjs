const fs = require('fs');

// 1. AdminHeader.jsx
let ah = fs.readFileSync('frontend/components/admin/dashboard/AdminHeader.jsx', 'utf8');
ah = ah.replace(
    'import { logout } from "@/redux/auth/auth_slice";',
    'import { adminLogout } from "@/redux/admin/auth/admin_auth_slice";'
);
ah = ah.replace(
    'const { user } = useSelector((state) => state.auth || {});',
    'const { adminUser: user } = useSelector((state) => state.adminAuth || {});'
);
ah = ah.replace(
    'await dispatch(logout());\r\n      router.push("/login");',
    'await dispatch(adminLogout());\r\n      router.push("/admin/login");'
);
ah = ah.replace(
    'await dispatch(logout());\n      router.push("/login");',
    'await dispatch(adminLogout());\n      router.push("/admin/login");'
);
ah = ah.replace(
    'catch {\r\n      router.push("/login");\r\n    }',
    'catch {\r\n      router.push("/admin/login");\r\n    }'
);
ah = ah.replace(
    'catch {\n      router.push("/login");\n    }',
    'catch {\n      router.push("/admin/login");\n    }'
);
fs.writeFileSync('frontend/components/admin/dashboard/AdminHeader.jsx', ah, 'utf8');
console.log('AdminHeader.jsx updated');

// 2. AdminSidebar.jsx
let asb = fs.readFileSync('frontend/components/admin/dashboard/AdminSidebar.jsx', 'utf8');
asb = asb.replace(
    'import { logout } from "@/redux/auth/auth_slice";',
    'import { adminLogout } from "@/redux/admin/auth/admin_auth_slice";'
);
asb = asb.replace(
    'const { user } = useSelector((state) => state.auth || {});',
    'const { adminUser: user } = useSelector((state) => state.adminAuth || {});'
);
asb = asb.replace(
    'await dispatch(logout());\r\n      router.push("/login");',
    'await dispatch(adminLogout());\r\n      router.push("/admin/login");'
);
asb = asb.replace(
    'await dispatch(logout());\n      router.push("/login");',
    'await dispatch(adminLogout());\n      router.push("/admin/login");'
);
asb = asb.replace(
    'catch {\r\n      router.push("/login");\r\n    }',
    'catch {\r\n      router.push("/admin/login");\r\n    }'
);
asb = asb.replace(
    'catch {\n      router.push("/login");\n    }',
    'catch {\n      router.push("/admin/login");\n    }'
);
fs.writeFileSync('frontend/components/admin/dashboard/AdminSidebar.jsx', asb, 'utf8');
console.log('AdminSidebar.jsx updated');

