body {
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    width: 320px;
    padding: 10px 15px;
    background-color: #f8f9fa;
}
.container { text-align: center; }
.header { display: flex; justify-content: space-between; align-items: center; }
.header h3 { margin: 0; color: #343a40; }
#manage-btn { background: none; border: none; font-size: 20px; cursor: pointer; padding: 5px; border-radius: 50%; }
#manage-btn:hover { background-color: #e9ecef; }
#page-info { color: #6c757d; font-size: 13px; word-wrap: break-word; }
.btn { width: 100%; border: none; padding: 10px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; transition: background-color 0.2s; }
.btn:disabled { cursor: not-allowed; opacity: 0.6; }
.btn.primary { background-color: #007bff; color: white; }
.btn.primary:hover:not(:disabled) { background-color: #0056b3; }
.btn.danger { background-color: #dc3545; color: white; }
.btn.danger:hover:not(:disabled) { background-color: #c82333; }
#add-section { display: flex; gap: 8px; }
#duration-select { flex-grow: 1; border-radius: 8px; border: 1px solid #ced4da; padding: 0 5px; }
#warning-area { margin: 10px 0; padding: 10px; border-radius: 8px; text-align: left; }
.warning { background-color: #fff3cd; border: 1px solid #ffeeba; color: #856404; }
.critical { background-color: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; }
#feedback-area { margin-top: 10px; font-weight: 500; color: #28a745; }
