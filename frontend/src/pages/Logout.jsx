import "../../styles/Logout.css";

function Logout({ onLogout }) {
	const handleLogout = () => {
		onLogout();
	};

	return (
		<button
			type="button"
			className="logout-button"
			onClick={handleLogout}
		>
			<span>↪</span>
			Logout
		</button>
	);
}

export default Logout;