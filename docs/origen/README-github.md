# Argos 👁️

> Laboratorio educativo de ciberseguridad para entender, identificar, simular de forma segura y aprender a detectar amenazas, con apoyo de inteligencia artificial.

El nombre viene de **Argos Panoptes**, el gigante de la mitología griega que tenía cien ojos y nunca dormía del todo. Argos está hecho para **vigilar, detectar y comprender**, no para atacar.

## Qué es

Argos tiene dos partes:

1. **App web de aprendizaje.** Módulos interactivos que explican una amenaza por vez: qué es, cómo se simula en un entorno controlado y cómo se defiende.
2. **Laboratorio de detección con IA.** Notebooks que usan datasets públicos y etiquetados de tráfico de red para entrenar modelos que distinguen tráfico normal de ataques, y que explican sus aciertos y sus límites.

## Principios

- **Costo cero.** Solo planes gratuitos y herramientas libres.
- **Seguridad primero.** Todo se simula en un sandbox local. Ver [ETICA.md](ETICA.md).
- **Paso a paso.** Cada fase termina en un entregable revisado antes de seguir.

## Módulos previstos

| Módulo | Qué enseña | Práctica segura |
|---|---|---|
| Phishing (primero) | Señales de un mensaje engañoso | Bandeja de correos inventados dentro de la app |
| Inyección SQL | Consultas inseguras frente a parametrizadas | Formulario local con una base falsa |
| XSS | Texto sin escapar en una página | Comentarios en un sandbox cerrado |
| Fuerza bruta | Logins débiles y falta de límites | Login de juguete, solo local |
| Malware, lo básico | Familias, vías de entrada e indicadores | Hashes y metadatos, sin ejecutar muestras |
| Ransomware, conceptos | Secuestro de archivos y backups | Archivos de prueba cifrados de forma reversible |

## Laboratorio de datos

- **Datasets:** [CIC-IDS2017](https://www.unb.ca/cic/datasets/ids-2017.html) (principal, versión CSV) y [UNSW-NB15](https://research.unsw.edu.au/projects/unsw-nb15-dataset) (uso académico, no comercial). Se citan según los términos de sus autores. Los datos no se suben a este repo.
- **Modelos:** regresión logística como base y random forest, con scikit-learn.
- **Métricas:** precisión, recall, F1, AUC y tasa de falsos positivos.
- **Límite honesto:** son datasets de laboratorio con años de antigüedad; un buen resultado acá no garantiza lo mismo en una red real.

## Stack (gratuito)

- App: React, TypeScript y Vite, con hosting en Vercel (plan Hobby).
- Lab: Python, Jupyter, pandas y scikit-learn, en local o en Google Colab.

## Hoja de ruta

- [ ] **Fase 0.** Preparación: repo, README y reglas de ética.
- [ ] **Fase 1.** MVP de la app con el módulo de phishing.
- [ ] **Fase 2.** Módulos de inyección SQL, XSS y fuerza bruta.
- [ ] **Fase 3.** Laboratorio de datos con CIC-IDS2017.
- [ ] **Fase 4.** Panel de detección en la app, más los módulos de malware y ransomware.
- [ ] **Fase 5.** Pulido para portfolio.

## Autor

Agustín Delgado, Buenos Aires. [Portfolio](https://portfolio-me-f104.vercel.app/)

## Licencia

Código bajo licencia [MIT](LICENSE). El uso de Argos está sujeto a las reglas de [ETICA.md](ETICA.md).
