const Layout: React.FC = () => {

    const navigate = (page: string) => {
        window.location.href = '/'+page;
    };


    return (
        <div className="layout">
            <button onClick={()=>navigate('students')}> Show Students </button>
            <button onClick={()=>navigate('fees')}> Show Fees </button>
        </div>
    );
};


export default Layout;