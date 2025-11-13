import "./Profile.css";

export default function Profile() {
  return (
    <div className="profile-page">
      <header className="profile-header">
        <p>Visualiza y actualiza tus datos personales.</p>
      </header>

      <div className="profile-grid">
        {/* Info compacta */}
        <div className="profile-info-compact">
          <img
            src="https://ui-avatars.com/api/?name=Jhon+Michael+Sierra&background=1e3a8a&color=fff"
            alt="Perfil"
            className="profile-avatar"
          />
          <ul className="profile-details">
            <li><strong>Nombre:</strong> Jhon Michael Sierra Rodríguez</li>
            <li><strong>Rol:</strong> Estudiante</li>
            <li><strong>Email:</strong> jhonsierrarodriguezitla@example.com</li>
          </ul>
        </div>

        <div className="profile-summary">
          <div className="summary-card">
            <h3>Materias Cursadas</h3>
            <p>3</p>
          </div>
          <div className="summary-card">
            <h3>Promedio General</h3>
            <p>91.0</p>
          </div>
        </div>
      </div>
    </div>
  );
}
