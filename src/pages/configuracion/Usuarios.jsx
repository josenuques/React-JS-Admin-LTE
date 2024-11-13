import React, { useState, useEffect, useRef, useContext } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Dropdown } from 'primereact/dropdown';
import { ToggleButton } from 'primereact/togglebutton';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { UserContext } from '../../context/UserProvider';
import LoadingOverlay from '../../components/LoadingOverlay';
import classNames from 'classnames';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { ListarUsuarios, GuardarUsuario, EliminarUsuario, usuarioModelo } from '../../servicios/configuracion/Usuarios';
import { obtenerPerfiles } from '../../servicios/configuracion/Perfiles';

const Usuarios = () => {
    const { user } = useContext(UserContext);
    const [usuarios, setUsuarios] = useState(null);
    const [perfiles, setPerfiles] = useState([]);
    const [usuarioDialog, setUsuarioDialog] = useState(false);
    const [deleteUsuarioDialog, setDeleteUsuarioDialog] = useState(false);
    const [usuario, setUsuario] = useState(usuarioModelo);
    const [selectedUsuarios, setSelectedUsuarios] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const [loading, setLoading] = useState(false);
    const toast = useRef(null);
    const dt = useRef(null);

    useEffect(() => {
        cargarUsuarios();
        cargarPerfiles();
    }, []);

    const cargarUsuarios = async () => {
        try {
            setLoading(true);
            const data = await ListarUsuarios(user.idempresa);
            setUsuarios(data);
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Error al cargar usuarios', life: 3000 });
        } finally {
            setLoading(false);
        }
    };

    const cargarPerfiles = async () => {
        try {
            setLoading(true);
            const data = await obtenerPerfiles(user.idempresa);
            const perfilesFormateados = data.map(p => ({
                label: p.descripcion,
                value: p.id
            }));
            setPerfiles(perfilesFormateados);
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Error al cargar perfiles', life: 3000 });
        } finally {
            setLoading(false);
        }
    };

    const openNew = () => {
        setUsuario({
            ...usuarioModelo,
            idempresa: user.idempresa
        });
        setSubmitted(false);
        setUsuarioDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setUsuarioDialog(false);
    };

    const hideDeleteUsuarioDialog = () => {
        setDeleteUsuarioDialog(false);
    };

    const saveUsuario = async () => {
        setSubmitted(true);

        if (usuario.nombres.trim() && usuario.correo.trim()) {
            try {
                setLoading(true);
                const response = await GuardarUsuario(usuario);
                if (response) {
                    toast.current.show({ 
                        severity: 'success', 
                        summary: 'Exitoso', 
                        detail: usuario.id ? 'Usuario actualizado' : 'Usuario creado', 
                        life: 3000 
                    });
                    await cargarUsuarios();
                    setUsuarioDialog(false);
                    setUsuario(usuarioModelo);
                }
            } catch (error) {
                toast.current.show({ 
                    severity: 'error', 
                    summary: 'Error', 
                    detail: 'Error al guardar el usuario', 
                    life: 3000 
                });
            } finally {
                setLoading(false);
            }
        }
    };

    const editUsuario = (usuario) => {
        setUsuario({ ...usuario });
        setUsuarioDialog(true);
    };

    const confirmDeleteUsuario = (usuario) => {
        setUsuario(usuario);
        setDeleteUsuarioDialog(true);
    };

    const deleteUsuario = async () => {
        try {
            setLoading(true);
            await EliminarUsuario(user.idempresa, usuario.id);
            await cargarUsuarios();
            setDeleteUsuarioDialog(false);
            setUsuario(usuarioModelo);
            toast.current.show({ severity: 'success', summary: 'Exitoso', detail: 'Usuario eliminado', life: 3000 });
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Error al eliminar el usuario', life: 3000 });
        } finally {
            setLoading(false);
        }
    };

    const exportExcel = () => {
        const exportData = usuarios.map(({ clave, ...rest }) => rest);
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Usuarios");
        XLSX.writeFile(workbook, "usuarios.xlsx");
    };

    const exportPDF = () => {
        const doc = new jsPDF('p', 'pt');
        const exportData = usuarios.map(({ clave, ...rest }) => [
            rest.nombres,
            rest.apellidos,
            rest.correo,
            rest.perfil,
            rest.estado ? 'Activo' : 'Inactivo'
        ]);
        doc.autoTable({
            head: [['Nombres', 'Apellidos', 'Correo', 'Perfil', 'Estado']],
            body: exportData,
        });
        doc.save('usuarios.pdf');
    };

    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || '';
        let _usuario = {...usuario};
        _usuario[`${name}`] = val;

        if (name === 'nombres' || name === 'apellidos') {
            _usuario.nombrecompleto = `${_usuario.nombres} ${_usuario.apellidos}`.trim();
        }

        setUsuario(_usuario);
    };

    const onEstadoChange = (e) => {
        let _usuario = {...usuario};
        _usuario.estado = e.value;
        _usuario.estadotexto = e.value ? 'Activo' : 'Inactivo';
        setUsuario(_usuario);
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
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => editUsuario(rowData)} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-warning" onClick={() => confirmDeleteUsuario(rowData)} />
            </>
        );
    };

    const header = (
        <div className="table-header">
            <h5 className="mx-0 my-1">Gestión de Usuarios</h5>
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Buscar..." />
            </span>
        </div>
    );

    const usuarioDialogFooter = (
        <React.Fragment>
            <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={hideDialog} disabled={loading} />
            <Button label="Guardar" icon="pi pi-check" className="p-button-text" onClick={saveUsuario} disabled={loading} />
        </React.Fragment>
    );

    const deleteUsuarioDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteUsuarioDialog} disabled={loading} />
            <Button label="Sí" icon="pi pi-check" className="p-button-text" onClick={deleteUsuario} disabled={loading} />
        </React.Fragment>
    );

    return (
        <div className="datatable-crud-demo">
            <LoadingOverlay visible={loading} />
            <Toast ref={toast} />

            <div className="card">
                <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>

                <DataTable 
                    ref={dt} 
                    value={usuarios}
                    selection={selectedUsuarios}
                    onSelectionChange={(e) => setSelectedUsuarios(e.value)}
                    dataKey="id" 
                    paginator 
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25]}
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} usuarios"
                    globalFilter={globalFilter}
                    header={header}
                    responsiveLayout="scroll"
                >
                    <Column field="nombres" header="Nombres" sortable style={{ minWidth: '12rem' }}></Column>
                    <Column field="apellidos" header="Apellidos" sortable style={{ minWidth: '12rem' }}></Column>
                    <Column field="correo" header="Correo" sortable style={{ minWidth: '12rem' }}></Column>
                    <Column field="perfil" header="Perfil" sortable style={{ minWidth: '10rem' }}></Column>
                    <Column field="estadotexto" header="Estado" sortable style={{ minWidth: '8rem' }}></Column>
                    <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '8rem' }}></Column>
                </DataTable>
            </div>

            <Dialog 
                visible={usuarioDialog} 
                style={{ width: '450px' }} 
                header="Detalles de Usuario" 
                modal 
                className="p-fluid" 
                footer={usuarioDialogFooter} 
                onHide={hideDialog}
                closable={!loading}
            >
                <div className="field">
                    <label htmlFor="nombres">Nombres</label>
                    <InputText 
                        id="nombres" 
                        value={usuario.nombres} 
                        onChange={(e) => onInputChange(e, 'nombres')} 
                        required 
                        autoFocus 
                        className={classNames({ 'p-invalid': submitted && !usuario.nombres })} 
                        disabled={loading}
                    />
                    {submitted && !usuario.nombres && <small className="p-error">El nombre es requerido.</small>}
                </div>
                <div className="field">
                    <label htmlFor="apellidos">Apellidos</label>
                    <InputText 
                        id="apellidos" 
                        value={usuario.apellidos} 
                        onChange={(e) => onInputChange(e, 'apellidos')} 
                        required 
                        className={classNames({ 'p-invalid': submitted && !usuario.apellidos })} 
                        disabled={loading}
                    />
                    {submitted && !usuario.apellidos && <small className="p-error">El apellido es requerido.</small>}
                </div>
                <div className="field">
                    <label htmlFor="correo">Correo</label>
                    <InputText 
                        id="correo" 
                        value={usuario.correo} 
                        onChange={(e) => onInputChange(e, 'correo')} 
                        required 
                        className={classNames({ 'p-invalid': submitted && !usuario.correo })} 
                        disabled={loading}
                    />
                    {submitted && !usuario.correo && <small className="p-error">El correo es requerido.</small>}
                </div>
                <div className="field">
                    <label htmlFor="clave">Contraseña</label>
                    <Password
                        id="clave"
                        value={usuario.clave}
                        onChange={(e) => onInputChange(e, 'clave')}
                        required={!usuario.id}
                        toggleMask
                        className={classNames({ 'p-invalid': submitted && !usuario.clave && !usuario.id })}
                        feedback={false}
                        disabled={loading}
                    />
                    {submitted && !usuario.clave && !usuario.id && <small className="p-error">La contraseña es requerida.</small>}
                </div>
                <div className="field">
                    <label htmlFor="idperfil">Perfil</label>
                    <Dropdown
                        id="idperfil"
                        value={usuario.idperfil}
                        options={perfiles}
                        onChange={(e) => onInputChange(e, 'idperfil')}
                        placeholder="Seleccione un perfil"
                        className={classNames({ 'p-invalid': submitted && !usuario.idperfil })}
                        disabled={loading}
                    />
                    {submitted && !usuario.idperfil && <small className="p-error">El perfil es requerido.</small>}
                </div>
                <div className="field">
                    <label htmlFor="estado">Estado</label>
                    <ToggleButton 
                        checked={usuario.estado} 
                        onChange={onEstadoChange} 
                        onLabel="Activo" 
                        offLabel="Inactivo" 
                        onIcon="pi pi-check" 
                        offIcon="pi pi-times"
                        disabled={loading}
                    />
                </div>
            </Dialog>

            <Dialog 
                visible={deleteUsuarioDialog} 
                style={{ width: '450px' }} 
                header="Confirmar" 
                modal 
                footer={deleteUsuarioDialogFooter} 
                onHide={hideDeleteUsuarioDialog}
                closable={!loading}
            >
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem'}} />
                    {usuario && <span>¿Está seguro de que desea eliminar a <b>{usuario.nombrecompleto}</b>?</span>}
                </div>
            </Dialog>
        </div>
    );
};

export default Usuarios;