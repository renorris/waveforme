// Waveforme Layout index.tsx
// Copyright (C) 2023 Reese Norris - All Rights Reserved

import * as React from "react";
import Header from "./Header";

function Layout(props: React.PropsWithChildren) {
    return (
        <div>
            <Header />
            { props.children }
        </div>
    );
}

export default Layout;