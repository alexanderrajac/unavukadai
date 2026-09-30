import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.hash = '#/customer';
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '70vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px 20px',
          textAlign: 'center',
          background: '#0d1117',
          color: '#f3f4f6'
        }}>
          <div style={{
            fontSize: '56px',
            marginBottom: '16px'
          }}>🛡️</div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '8px', color: '#f87171' }}>
            Portal Rendering Notice
          </h2>
          <p style={{ color: '#9ca3af', maxWidth: '440px', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
            {this.state.error?.message || 'A minor interface error occurred while rendering this portal.'}
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
              }}
              style={{
                padding: '10px 20px',
                borderRadius: '10px',
                background: '#dc2626',
                color: '#fff',
                border: 'none',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              🔄 Retry Portal
            </button>
            <button
              onClick={this.handleReset}
              style={{
                padding: '10px 20px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#e5e7eb',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              🍲 Return to Customer App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
