import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard(){
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const [data, setData] = useState(null);
    
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/Login");
        }
        const fetchData = async () => {
            try { 
              const res = await fetch("http://localhost:4000/api/dashboard", {
                method: "GET",
                headers: { "Authorization": `Bearer ${token}` },
              });
              if (!res.ok) {
                throw new Error("No autorizado");
              }
      
              const result = await res.json();
              setData(result);
            } catch (error) {
              console.error("Error fetching data:", error);
              navigate("/Login");
            }
          };
        fetchData();      

    }, [navigate]);	


    return(
        <h1>Bienvenido al dashboard</h1>
    );
}