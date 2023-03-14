import os

carpeta = "Imagenes"
ruta_carpeta = os.path.join(os.getcwd(), carpeta)

nombres_archivos = os.listdir(ruta_carpeta)
nombres_archivos = [f"{carpeta}/{nombre}" for nombre in nombres_archivos]

with open("nombres_archivos.txt", "w") as archivo:
    archivo.write("\n".join(nombres_archivos))
