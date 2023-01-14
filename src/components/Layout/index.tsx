import * as React from "react";
import Header from "../Header";

function Layout(props: any) {
    return (
        <div>
            <Header />
            { props.children }
        </div>
    );
}

export default Layout;