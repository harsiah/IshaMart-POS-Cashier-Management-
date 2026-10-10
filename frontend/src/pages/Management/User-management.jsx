import { useEffect, useState } from "react";
import {
	MoreVertical,
	Plus,
	Search,
	ShieldCheck,
	UserCheck,
	UserRound,
	UserX,
	X,
} from "lucide-react";
import { API_BASE_URL } from "../../services/endpoint";
import "../../../styles/management/User-management.css";

const USERS_ENDPOINT = `${API_BASE_URL}/users`;

async function requestUsers(path = "/", options = {}) {
	const token = localStorage.getItem("access_token");
	const response = await fetch(`${USERS_ENDPOINT}${path}`, {
		...options,
		headers: {
			Authorization: `Bearer ${token}`,
			...(options.body ? { "Content-Type": "application/json" } : {}),
			...options.headers,
		},
	});
	const data = await response.json().catch(() => null);

	if (!response.ok || /already exists|not found/i.test(data?.message || "")) {
		throw new Error(data?.detail || data?.message || "Permintaan gagal. Coba lagi.");
	}

	return data;
}

function formatRole(role) {
	return role.charAt(0).toUpperCase() + role.slice(1);
}

function formatLastActive(value) {
	if (!value) return "Never";

	return new Intl.DateTimeFormat("id-ID", {
		day: "2-digit",
		month: "short",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	}).format(new Date(value));
}

function UserManagement() {
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [search, setSearch] = useState("");
	const [roleFilter, setRoleFilter] = useState("all");
	const [statusFilter, setStatusFilter] = useState("all");
	const [isAddModalOpen, setIsAddModalOpen] = useState(false);
	const [editingUser, setEditingUser] = useState(null);
	const [editUserForm, setEditUserForm] = useState({ username: "", password: "", role: "cashier" });
	const [formError, setFormError] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [busyUserId, setBusyUserId] = useState(null);
	const [newUser, setNewUser] = useState({ username: "", password: "", role: "cashier" });

	async function loadUsers() {
		setLoading(true);
		setError("");

		try {
			const data = await requestUsers();
			setUsers(Array.isArray(data) ? data : []);
		} catch (requestError) {
			setError(requestError.message);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		loadUsers();
	}, []);

	const activeCount = users.filter((user) => user.is_active).length;
	const inactiveCount = users.length - activeCount;
	const roles = [...new Set(["admin", "cashier", ...users.map((user) => user.role)])];
	const filteredUsers = users.filter((user) => {
		const matchesSearch = user.username.toLowerCase().includes(search.trim().toLowerCase());
		const matchesRole = roleFilter === "all" || user.role === roleFilter;
		const matchesStatus = statusFilter === "all"
			|| (statusFilter === "active" ? user.is_active : !user.is_active);

		return matchesSearch && matchesRole && matchesStatus;
	});

	async function handleAddUser(event) {
		event.preventDefault();
		setIsSubmitting(true);
		setFormError("");

		try {
			await requestUsers("/", {
				method: "POST",
				body: JSON.stringify(newUser),
			});
			setIsAddModalOpen(false);
			setNewUser({ username: "", password: "", role: "cashier" });
			await loadUsers();
		} catch (requestError) {
			setFormError(requestError.message);
		} finally {
			setIsSubmitting(false);
		}
	}

	async function handleEditUser(event) {
		event.preventDefault();
		setIsSubmitting(true);
		setFormError("");

		const updates = {
			username: editUserForm.username,
			role: editUserForm.role,
		};
		if (editUserForm.password) updates.password = editUserForm.password;

		try {
			await requestUsers(`/${editingUser.id}`, {
				method: "PUT",
				body: JSON.stringify(updates),
			});
			setUsers((currentUsers) => currentUsers.map((user) => (
				user.id === editingUser.id
					? { ...user, username: updates.username, role: updates.role }
					: user
			)));
			setEditingUser(null);
			setEditUserForm({ username: "", password: "", role: "cashier" });
		} catch (requestError) {
			setFormError(requestError.message);
		} finally {
			setIsSubmitting(false);
		}
	}

	async function handleToggleStatus(user, event) {
		event.currentTarget.closest("details")?.removeAttribute("open");
		setBusyUserId(user.id);
		setError("");

		try {
			const action = user.is_active ? "deactivate" : "activate";
			await requestUsers(`/${user.id}/${action}`, { method: "PUT" });
			setUsers((currentUsers) => currentUsers.map((currentUser) => (
				currentUser.id === user.id
					? { ...currentUser, is_active: !user.is_active }
					: currentUser
			)));
		} catch (requestError) {
			setError(requestError.message);
		} finally {
			setBusyUserId(null);
		}
	}

	return (
		<div className="user-management-page">
			<header className="user-management-heading">
				<div>
					<p className="user-management-eyebrow">ACCESS &amp; TEAM</p>
					<h1>User Management</h1>
					<p>Manage users and access permissions</p>
				</div>
				<button
					className="user-management-add-button"
					type="button"
					onClick={() => {
						setFormError("");
						setIsAddModalOpen(true);
					}}
				>
					<Plus size={17} aria-hidden="true" />
					Add User
				</button>
			</header>

			<section className="user-management-stats" aria-label="User summary">
				<article className="user-management-stat-card">
					<span className="user-management-stat-icon total"><UserRound size={19} /></span>
					<div><span>Total Users</span><strong>{loading ? "—" : users.length}</strong></div>
				</article>
				<article className="user-management-stat-card">
					<span className="user-management-stat-icon active"><UserCheck size={19} /></span>
					<div><span>Active</span><strong>{loading ? "—" : activeCount}</strong></div>
				</article>
				<article className="user-management-stat-card">
					<span className="user-management-stat-icon inactive"><UserX size={19} /></span>
					<div><span>Inactive</span><strong>{loading ? "—" : inactiveCount}</strong></div>
				</article>
			</section>

			<section className="user-management-list" aria-label="User list">
				<div className="user-management-toolbar">
					<label className="user-management-search">
						<Search size={17} aria-hidden="true" />
						<input
							type="search"
							value={search}
							onChange={(event) => setSearch(event.target.value)}
							placeholder="Search username..."
							aria-label="Search username"
						/>
					</label>

					<label className="user-management-filter">
						<span className="sr-only">Filter by role</span>
						<select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
							<option value="all">All Roles</option>
							{roles.map((role) => <option key={role} value={role}>{formatRole(role)}</option>)}
						</select>
					</label>

					<label className="user-management-filter">
						<span className="sr-only">Filter by status</span>
						<select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
							<option value="all">All Status</option>
							<option value="active">Active</option>
							<option value="inactive">Inactive</option>
						</select>
					</label>
				</div>

				{error && (
					<div className="user-management-error" role="alert">
						<span>{error}</span>
						<button type="button" onClick={loadUsers}>Try again</button>
					</div>
				)}

				<div className="table-scroll">
					<table className="user-management-table">
						<thead>
							<tr>
								<th scope="col">Username</th>
								<th scope="col">Role</th>
								<th scope="col">Status</th>
								<th scope="col">Last Active</th>
								<th scope="col"><span className="sr-only">Actions</span></th>
							</tr>
						</thead>
						<tbody>
							{loading ? (
								<tr><td className="user-management-empty" colSpan="5">Loading users...</td></tr>
							) : filteredUsers.length ? filteredUsers.map((user) => (
								<tr key={user.id}>
									<td>
										<div className="user-management-identity">
											<span className="user-management-avatar" aria-hidden="true">
												{user.username.charAt(0).toUpperCase()}
											</span>
											<strong>{user.username}</strong>
										</div>
									</td>
									<td>
										<span className={`user-management-role role-${user.role.toLowerCase()}`}>
											<ShieldCheck size={14} aria-hidden="true" />
											{formatRole(user.role)}
										</span>
									</td>
									<td>
										<span className={`user-management-status ${user.is_active ? "is-active" : "is-inactive"}`}>
											<span aria-hidden="true" />
											{user.is_active ? "Active" : "Inactive"}
										</span>
									</td>
									<td>
										<time
											className={`user-management-last-active${user.last_active_at ? "" : " is-never"}`}
											dateTime={user.last_active_at || undefined}
											title={user.last_active_at ? new Date(user.last_active_at).toLocaleString("id-ID") : undefined}
										>
											{formatLastActive(user.last_active_at)}
										</time>
									</td>
									<td className="user-management-actions-cell">
										<details className="user-management-actions">
											<summary aria-label={`Actions for ${user.username}`}>
												<MoreVertical size={18} aria-hidden="true" />
											</summary>
											<div className="user-management-actions-menu">
												<button
													type="button"
													disabled={busyUserId === user.id}
													onClick={(event) => {
														event.currentTarget.closest("details")?.removeAttribute("open");
														setFormError("");
														setEditUserForm({ username: user.username, password: "", role: user.role });
														setEditingUser(user);
													}}
												>
													Edit user
												</button>
												<button
													type="button"
													disabled={busyUserId === user.id}
													onClick={(event) => handleToggleStatus(user, event)}
												>
													{user.is_active ? "Deactivate user" : "Activate user"}
												</button>
											</div>
										</details>
									</td>
								</tr>
							)) : (
								<tr>
									<td className="user-management-empty" colSpan="5">
										{error ? "User list is unavailable." : "No users match these filters."}
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
				<footer className="user-management-table-footer">
					Showing <strong>{loading ? 0 : filteredUsers.length}</strong> of <strong>{loading ? 0 : users.length}</strong> users
				</footer>
			</section>

			{isAddModalOpen && (
				<div className="user-management-modal-backdrop" onMouseDown={(event) => {
					if (event.target === event.currentTarget) setIsAddModalOpen(false);
				}}>
					<section
						className="user-management-modal"
						role="dialog"
						aria-modal="true"
						aria-labelledby="add-user-title"
					>
						<header className="user-management-modal-heading">
							<div>
								<p className="user-management-eyebrow">TEAM ACCESS</p>
								<h2 id="add-user-title">Add User</h2>
							</div>
							<button
								className="user-management-close-button"
								type="button"
								aria-label="Close dialog"
								onClick={() => setIsAddModalOpen(false)}
							>
								<X size={19} />
							</button>
						</header>

						<form onSubmit={handleAddUser}>
							<label className="user-management-field">
								<span>Username</span>
								<input
									autoFocus
									required
									value={newUser.username}
									onChange={(event) => setNewUser({ ...newUser, username: event.target.value })}
									placeholder="Enter username"
								/>
							</label>
							<label className="user-management-field">
								<span>Password</span>
								<input
									required
									type="password"
									value={newUser.password}
									onChange={(event) => setNewUser({ ...newUser, password: event.target.value })}
									placeholder="Create a password"
								/>
							</label>
							<label className="user-management-field">
								<span>Role</span>
								<select
									value={newUser.role}
									onChange={(event) => setNewUser({ ...newUser, role: event.target.value })}
								>
									<option value="cashier">Cashier</option>
									<option value="admin">Admin</option>
								</select>
							</label>

							{formError && <p className="user-management-form-error" role="alert">{formError}</p>}

							<footer className="user-management-modal-actions">
								<button type="button" className="user-management-cancel-button" onClick={() => setIsAddModalOpen(false)}>
									Cancel
								</button>
								<button type="submit" className="user-management-add-button" disabled={isSubmitting}>
									<Plus size={16} aria-hidden="true" />
									{isSubmitting ? "Adding..." : "Add User"}
								</button>
							</footer>
						</form>
					</section>
				</div>
			)}

			{editingUser && (
				<div className="user-management-modal-backdrop" onMouseDown={(event) => {
					if (event.target === event.currentTarget) setEditingUser(null);
				}}>
					<section
						className="user-management-modal"
						role="dialog"
						aria-modal="true"
						aria-labelledby="edit-user-title"
					>
						<header className="user-management-modal-heading">
							<div>
								<p className="user-management-eyebrow">TEAM ACCESS</p>
								<h2 id="edit-user-title">Edit User</h2>
							</div>
							<button
								className="user-management-close-button"
								type="button"
								aria-label="Close dialog"
								onClick={() => setEditingUser(null)}
							>
								<X size={19} />
							</button>
						</header>

						<form onSubmit={handleEditUser}>
							<label className="user-management-field">
								<span>Username</span>
								<input
									autoFocus
									required
									value={editUserForm.username}
									onChange={(event) => setEditUserForm({ ...editUserForm, username: event.target.value })}
									placeholder="Enter username"
								/>
							</label>
							<label className="user-management-field">
								<span>New Password <small>(optional)</small></span>
								<input
									type="password"
									value={editUserForm.password}
									onChange={(event) => setEditUserForm({ ...editUserForm, password: event.target.value })}
									placeholder="Leave blank to keep current password"
								/>
							</label>
							<label className="user-management-field">
								<span>Role</span>
								<select
									value={editUserForm.role}
									onChange={(event) => setEditUserForm({ ...editUserForm, role: event.target.value })}
								>
									<option value="cashier">Cashier</option>
									<option value="admin">Admin</option>
								</select>
							</label>

							{formError && <p className="user-management-form-error" role="alert">{formError}</p>}

							<footer className="user-management-modal-actions">
								<button type="button" className="user-management-cancel-button" onClick={() => setEditingUser(null)}>
									Cancel
								</button>
								<button type="submit" className="user-management-add-button" disabled={isSubmitting}>
									{isSubmitting ? "Saving..." : "Save changes"}
								</button>
							</footer>
						</form>
					</section>
				</div>
			)}
		</div>
	);
}

export default UserManagement;
