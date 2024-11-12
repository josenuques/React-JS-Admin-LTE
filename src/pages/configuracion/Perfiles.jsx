import React, { useState, useEffect, useRef, useContext } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { UserContext } from '../../context/UserProvider';
import classNames from 'classnames';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { obtenerPerfiles, ListarPermisos, GuardarPerfil, EliminarPerfil, perfilModelo, ListarComboNivelesSeguridad } from '../../servicios/configuracion/Perfiles';

const Perfiles = () => {
    const { user } = useContext(UserContext);
    const [perfiles, setPerfiles] = useState(null);
    const [perfilDialog, setPerfilDialog] = useState(false);
    const [deletePerfilDialog, setDeletePerfilDialog] = useState(false);
    const [perfil, setPerfil] = useState(perfilModelo);
    const [selectedPerfiles, setSelectedPerfiles] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const [permisos, setPermisos] = useState([]);
    const [nivelesSeguridad, setNivelesSeguridad] = useState([]);
    const toast = useRef(null);
    const dt = useRef(null);

    useEffect(() => {
        cargarPerfiles();
        cargarNivelesSeguridad();
    }, []);

    const cargarPerfiles = async () => {
        try {
            const data = await obtenerPerfiles(user.idempresa);
            setPerfiles(data);
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al cargar perfiles',
                life: 3000
            });
        }
    };

    const cargarNivelesSeguridad = async () => {
        try {
            const data = await ListarComboNivelesSeguridad();
            const nivelesFormateados = data.map(nivel => ({
                label: nivel.descripcion,
                value: nivel.idNivel,
                ...nivel
            }));
            setNivelesSeguridad(nivelesFormateados);
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al cargar niveles de seguridad',
                life: 3000
            });
        }
    };

    const cargarPermisos = async (idPerfil) => {
        try {
            const data = await ListarPermisos(idPerfil, user.idempresa);
            setPermisos(data);
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al cargar permisos',
                life: 3000
            });
        }
    };

    const openNew = async () => {
        setPerfil({
            ...perfilModelo,
            idempresa: user.idempresa
        });        
        await cargarPermisos(0);
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

    const savePerfil = async () => {
        setSubmitted(true);

        if (perfil.descripcion.trim()) {
            try {
                const perfilData = {
                    id: perfil.id,
                    idempresa: user.idempresa,
                    idNivelSeguridad: perfil.idNivelSeguridad,
                    descripcion: perfil.descripcion,
                    idNivel: perfil.idNivel,
                    nivel: perfil.nivel,
                    estado: perfil.estado,
                    permisos: permisos.map(p => ({
                        idEmpresa: user.idempresa,
                        idPerfil: perfil.id,
                        idOpcion: p.idSubMenu,
                        activo: p.activo ? 1 : 0
                    }))
                };

                const response = await GuardarPerfil(perfilData);
                if (response) {
                    toast.current.show({
                        severity: 'success',
                        summary: 'Exitoso',
                        detail: perfil.id ? 'Perfil actualizado' : 'Perfil creado',
                        life: 3000
                    });
                    await cargarPerfiles();
                    setPerfilDialog(false);
                    setPerfil(perfilModelo);
                }
            } catch (error) {
                toast.current.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al guardar el perfil',
                    life: 3000
                });
            }
        }
    };

    const editPerfil = async (perfil) => {
        setPerfil({ ...perfil });
        await cargarPermisos(perfil.id);
        setPerfilDialog(true);
    };

    const confirmDeletePerfil = (perfil) => {
        setPerfil(perfil);
        setDeletePerfilDialog(true);
    };

    const deletePerfil = async () => {
        try {
            await EliminarPerfil(user.idempresa, perfil.id);
            await cargarPerfiles();
            setDeletePerfilDialog(false);
            setPerfil(perfilModelo);
            toast.current.show({
                severity: 'success',
                summary: 'Exitoso',
                detail: 'Perfil eliminado',
                life: 3000
            });
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al eliminar el perfil',
                life: 3000
            });
        }
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
                perfil.nivel,
                perfil.estado ? 'Activo' : 'Inactivo'
            ]),
        });
        doc.save('perfiles.pdf');
    };

    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || '';
        let _perfil = {...perfil};
        _perfil[`${name}`] = val;

        if (name === 'idNivel') {
            const nivelSeleccionado = nivelesSeguridad.find(n => n.value === val);
            if (nivelSeleccionado) {
                _perfil.nivel = nivelSeleccionado.descripcion;
                _perfil.idNivelSeguridad = nivelSeleccionado.idNivel;
            }
        }

        setPerfil(_perfil);
    };

    const onPermissionChange = (e, rowData) => {
        const checked = e.checked;
        let _permisos = permisos.map(p => 
            p.idSubMenu === rowData.idSubMenu ? { ...p, activo: checked } : p
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
                    <Column field="nivel" header="Nivel Seguridad" sortable style={{ minWidth: '10rem' }}></Column>
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
                            <label htmlFor="idNivel">Nivel Seguridad:</label>
                            <Dropdown
                                id="idNivel"
                                value={perfil?.idNivel}
                                options={nivelesSeguridad}
                                onChange={(e) => onInputChange(e, 'idNivel')}
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
                                <Column field="idSubMenu" header="Código" style={{ width: '100px' }}></Column>
                                <Column field="menu" header="Módulo" style={{ width: '300px' }}></Column>
                                <Column field="subMenu" header="Opción" style={{ width: '300px' }}></Column>
                                <Column
                                    style={{ width: '100px' }}
                                    body={(rowData) => (
                                        <Checkbox
                                            checked={rowData.activo}
                                            onChange={(e) => onPermissionChange(e, rowData)}
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