import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import classNames from 'classnames';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Perfiles = () => {
    const [perfiles, setPerfiles] = useState(null);
    const [perfilDialog, setPerfilDialog] = useState(false);
    const [deletePerfilDialog, setDeletePerfilDialog] = useState(false);
    const [perfil, setPerfil] = useState(null);
    const [selectedPerfiles, setSelectedPerfiles] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const [permisos, setPermisos] = useState([]);
    const toast = useRef(null);
    const dt = useRef(null);

    const nivelesSeguridad = [
        { label: 'Nivel 1', value: 1 },
        { label: 'Nivel 2', value: 2 },
        { label: 'Nivel 3', value: 3 }
    ];

    useEffect(() => {
        // Simulated API data
        setPerfiles([
            {
                id: 1,
                descripcion: "Administrador",
                nivelSeguridad: 3,
                estado: true
            },
            {
                id: 2,
                descripcion: "Químico Farmacéutico",
                nivelSeguridad: 2,
                estado: true
            },
            {
                id: 3,
                descripcion: "Digitador",
                nivelSeguridad: 1,
                estado: true
            }
        ]);

        // Simulated permissions data
        setPermisos([
            { codigo: 9, modulo: "Ingresos", opcion: "Orden de Compra", selected: false },
            { codigo: 10, modulo: "Ingresos", opcion: "Inspección Vehicular", selected: false },
            { codigo: 11, modulo: "Ingresos", opcion: "Control y Revisión", selected: false },
            { codigo: 30, modulo: "Consultas Impresion, Edición y Aprobación", opcion: "Ordenes Compra", selected: false },
            { codigo: 38, modulo: "Consultas Impresion, Edición y Aprobación", opcion: "Controles Egresos", selected: false },
            { codigo: 34, modulo: "Consultas Impresion, Edición y Aprobación", opcion: "Ordenes Salida", selected: false },
            { codigo: 36, modulo: "Consultas Impresion, Edición y Aprobación", opcion: "Inspecciones Egresos", selected: false },
            { codigo: 44, modulo: "Consultas Impresion, Edición y Aprobación", opcion: "Egresos X Devoluciones", selected: false },
            { codigo: 45, modulo: "Consultas Impresion, Edición y Aprobación", opcion: "Ingresos X Devoluciones", selected: false },
            { codigo: 41, modulo: "Trazabilidad", opcion: "Trazabilidad por lotes", selected: false },
            { codigo: 42, modulo: "Trazabilidad", opcion: "Tablas de procesos", selected: false },
            { codigo: 48, modulo: "Reportes ARSA", opcion: "Reportes Formato ARSA", selected: false }
        ]);
    }, []);

    const openNew = () => {
        setPerfil({
            id: 0,
            descripcion: '',
            nivelSeguridad: 1,
            estado: true
        });
        // Reset all permissions
        setPermisos(permisos.map(p => ({ ...p, selected: false })));
        setSubmitted(false);
        setPerfilDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setPerfilDialog(false);
    };

    const hideDeletePerfilDialog = () => {
        setDeletePerfilDialog(false);
    };

    const savePerfil = () => {
        setSubmitted(true);

        if (perfil.descripcion.trim()) {
            let _perfiles = [...perfiles];
            let _perfil = {...perfil};
            
            if (perfil.id) {
                const index = findIndexById(perfil.id);
                _perfiles[index] = _perfil;
                toast.current.show({ severity: 'success', summary: 'Exitoso', detail: 'Perfil actualizado', life: 3000 });
            } else {
                _perfil.id = createId();
                _perfiles.push(_perfil);
                toast.current.show({ severity: 'success', summary: 'Exitoso', detail: 'Perfil creado', life: 3000 });
            }

            setPerfiles(_perfiles);
            setPerfilDialog(false);
            setPerfil(null);
        }
    };

    const editPerfil = (perfil) => {
        setPerfil({...perfil});
        // Simulated API call to get permissions for this profile
        setPerfilDialog(true);
    };

    const confirmDeletePerfil = (perfil) => {
        setPerfil(perfil);
        setDeletePerfilDialog(true);
    };

    const deletePerfil = () => {
        let _perfiles = perfiles.filter(val => val.id !== perfil.id);
        setPerfiles(_perfiles);
        setDeletePerfilDialog(false);
        setPerfil(null);
        toast.current.show({ severity: 'success', summary: 'Exitoso', detail: 'Perfil eliminado', life: 3000 });
    };

    const findIndexById = (id) => {
        let index = -1;
        for (let i = 0; i < perfiles.length; i++) {
            if (perfiles[i].id === id) {
                index = i;
                break;
            }
        }
        return index;
    };

    const createId = () => {
        return Math.max(...perfiles.map(p => p.id)) + 1;
    };

    const exportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(perfiles);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Perfiles");
        XLSX.writeFile(workbook, "perfiles.xlsx");
    };

    const exportPDF = () => {
        const doc = new jsPDF('p', 'pt');
        doc.autoTable({
            head: [['ID', 'Descripción', 'Nivel Seguridad', 'Estado']],
            body: perfiles.map(perfil => [
                perfil.id,
                perfil.descripcion,
                `Nivel ${perfil.nivelSeguridad}`,
                perfil.estado ? 'Activo' : 'Inactivo'
            ]),
        });
        doc.save('perfiles.pdf');
    };

    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || '';
        let _perfil = {...perfil};
        _perfil[`${name}`] = val;
        setPerfil(_perfil);
    };

    const onPermissionChange = (e, codigo) => {
        let _permisos = permisos.map(p => 
            p.codigo === codigo ? { ...p, selected: e.checked } : p
        );
        setPermisos(_permisos);
    };

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <Button label="Nuevo" icon="pi pi-plus" className="p-button-success mr-2" onClick={openNew} />
            </React.Fragment>
        );
    };

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <Button icon="pi pi-file-excel" className="p-button-help mr-2" onClick={exportExcel} />
                <Button icon="pi pi-file-pdf" className="p-button-warning" onClick={exportPDF} />
            </React.Fragment>
        );
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <>
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => editPerfil(rowData)} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-warning" onClick={() => confirmDeletePerfil(rowData)} />
            </>
        );
    };

    const header = (
        <div className="table-header">
            <h5 className="mx-0 my-1">Gestión de Perfiles</h5>
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Buscar..." />
            </span>
        </div>
    );

    const perfilDialogFooter = (
        <div>
            <Button label="Cerrar" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
            <Button label="Guardar" icon="pi pi-check" className="p-button-primary" onClick={savePerfil} />
        </div>
    );

    const deletePerfilDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeletePerfilDialog} />
            <Button label="Sí" icon="pi pi-check" className="p-button-text" onClick={deletePerfil} />
        </React.Fragment>
    );

    return (
        <div className="datatable-crud-demo">
            <Toast ref={toast} />

            <div className="card">
                <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>

                <DataTable
                    ref={dt}
                    value={perfiles}
                    selection={selectedPerfiles}
                    onSelectionChange={(e) => setSelectedPerfiles(e.value)}
                    dataKey="id"
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25]}
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} perfiles"
                    globalFilter={globalFilter}
                    header={header}
                    responsiveLayout="scroll"
                >
                    <Column field="descripcion" header="Descripción" sortable style={{ minWidth: '16rem' }}></Column>
                    <Column field="nivelSeguridad" header="Nivel Seguridad" body={(rowData) => `Nivel ${rowData.nivelSeguridad}`} sortable style={{ minWidth: '10rem' }}></Column>
                    <Column field="estado" header="Estado" body={(rowData) => rowData.estado ? 'Activo' : 'Inactivo'} sortable style={{ minWidth: '8rem' }}></Column>
                    <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '8rem' }}></Column>
                </DataTable>
            </div>

            <Dialog
                visible={perfilDialog}
                style={{ width: '80%', maxWidth: '900px' }}
                header="Registro de Perfil"
                modal
                className="p-fluid"
                footer={perfilDialogFooter}
                onHide={hideDialog}
            >
                <div className="grid">
                    <div className="col-12 md:col-6">
                        <div className="field">
                            <label htmlFor="descripcion">Descripción: <span className="text-red-500">*</span></label>
                            <InputText
                                id="descripcion"
                                value={perfil?.descripcion}
                                onChange={(e) => onInputChange(e, 'descripcion')}
                                required
                                autoFocus
                                className={classNames({ 'p-invalid': submitted && !perfil?.descripcion })}
                            />
                            {submitted && !perfil?.descripcion && <small className="p-error">La descripción es requerida.</small>}
                        </div>
                    </div>
                    <div className="col-12 md:col-6">
                        <div className="field">
                            <label htmlFor="nivelSeguridad">Nivel Seguridad:</label>
                            <Dropdown
                                id="nivelSeguridad"
                                value={perfil?.nivelSeguridad}
                                options={nivelesSeguridad}
                                onChange={(e) => onInputChange(e, 'nivelSeguridad')}
                                placeholder="Seleccione un nivel"
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-4">
                    <h5>Permisos</h5>
                    <div className="grid">
                        <div className="col-12">
                            <DataTable value={permisos} scrollable scrollHeight="400px">
                                <Column field="codigo" header="Código" style={{ width: '100px' }}></Column>
                                <Column field="modulo" header="Módulo" style={{ width: '300px' }}></Column>
                                <Column field="opcion" header="Opción" style={{ width: '300px' }}></Column>
                                <Column
                                    style={{ width: '100px' }}
                                    body={(rowData) => (
                                        <Checkbox
                                            checked={rowData.selected}
                                            onChange={(e) => onPermissionChange(e, rowData.codigo)}
                                        />
                                    )}
                                ></Column>
                            </DataTable>
                        </div>
                    </div>
                </div>
            </Dialog>

            <Dialog
                visible={deletePerfilDialog}
                style={{ width: '450px' }}
                header="Confirmar"
                modal
                footer={deletePerfilDialogFooter}
                onHide={hideDeletePerfilDialog}
            >
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {perfil && <span>¿Está seguro de que desea eliminar el perfil <b>{perfil.descripcion}</b>?</span>}
                </div>
            </Dialog>
        </div>
    );
};

export default Perfiles;