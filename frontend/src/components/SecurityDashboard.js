import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import axios from 'axios';

const SecurityDashboard = () => {
    const [securityStatus, setSecurityStatus] = useState(null);
    const [metrics, setMetrics] = useState(null);
    const [blockedIps, setBlockedIps] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSecurityData();
    }, []);

    const fetchSecurityData = async () => {
        try {
            const [statusRes, metricsRes, ipsRes] = await Promise.all([
                axios.get('/api/security/status'),
                axios.get('/api/security/metrics'),
                axios.get('/api/security/blocked-ips')
            ]);

            setSecurityStatus(statusRes.data);
            setMetrics(metricsRes.data);
            setBlockedIps(ipsRes.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching security data:', error);
            setLoading(false);
        }
    };

    const unblockIp = async (ip) => {
        try {
            await axios.post('/api/security/unblock-ip', { ip });
            fetchSecurityData();
        } catch (error) {
            console.error('Error unblocking IP:', error);
        }
    };

    if (loading) {
        return <div className="loader">Loading...</div>;
    }

    const securityMetrics = {
        rateLimit: metrics?.rateLimit || 0,
        xssAttempts: metrics?.xssAttempts || 0,
        csrfAttempts: metrics?.csrfAttempts || 0,
        sqlInjection: metrics?.sqlInjection || 0
    };

    const lineChartData = {
        labels: ['Rate Limit', 'XSS', 'CSRF', 'SQL Injection'],
        datasets: [
            {
                label: 'Security Events',
                data: Object.values(securityMetrics),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)'
                ],
                borderWidth: 1
            }
        ]
    };

    return (
        <div className="security-dashboard">
            <h2>Security Dashboard</h2>

            <div className="metrics-grid">
                <div className="metric-card">
                    <h3>Active Alerts</h3>
                    <p>{securityStatus?.activeAlerts || 0}</p>
                </div>
                <div className="metric-card">
                    <h3>Blocked IPs</h3>
                    <p>{blockedIps.length}</p>
                </div>
                <div className="metric-card">
                    <h3>Recent Events</h3>
                    <p>{securityStatus?.recentEvents || 0}</p>
                </div>
            </div>

            <div className="charts">
                <h3>Security Event Trends</h3>
                <Line data={lineChartData} />
            </div>

            <div className="blocked-ips">
                <h3>Blocked IPs</h3>
                <table>
                    <thead>
                        <tr>
                            <th>IP Address</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {blockedIps.map(ip => (
                            <tr key={ip}>
                                <td>{ip}</td>
                                <td>
                                    <button onClick={() => unblockIp(ip)}>
                                        Unblock
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SecurityDashboard;
