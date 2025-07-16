export default function exportar(){
    const exportData = async (tipo) => {
    const urls = {
        productos: 'http://localhost:3000/api/export/productos',
        registros: 'http://localhost:3000/api/export/registros',
        ventas: 'http://localhost:3000/api/export/ventas',
    };

    const token = localStorage.getItem('token'); // o donde guardes el JWT

    try {
        const response = await fetch(urls[tipo], {
        headers: {
            Authorization: `Bearer ${token}`
        }
        });

        if (!response.ok) throw new Error("Error en la exportación");

        const blob = await response.blob();
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = `${tipo}.csv`;
        link.click();
    } catch (err) {
        console.error(`Error exportando ${tipo}`, err);
    }
    };
    return{
        exportData
    }
}