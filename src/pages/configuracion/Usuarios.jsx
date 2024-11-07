import React, { useState, useEffect, useRef } from 'react';
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
import classNames from 'classnames';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Usuarios = () => {
    const [usuarios, setUsuarios] = useState(null);
    const [usuarioDialog, setUsuarioDialog] = useState(false);
    const [deleteUsuarioDialog, setDeleteUsuarioDialog] = useState(false);
    const [usuario, setUsuario] = useState(null);
    const [selectedUsuarios, setSelectedUsuarios] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);

    useEffect(() => {
        setUsuarios([
            { id: 1, nombre: 'Juan Pérez', email: 'juan@example.com', rol: 'Admin', clave: '', estado: 'Activo' },
            { id: 2, nombre: 'María García', email: 'maria@example.com', rol: 'Usuario', clave: '', estado: 'Inactivo' },
            { id: 3, nombre: 'Carlos López', email: 'carlos@example.com', rol: 'Usuario', clave: '', estado: 'Activo' },
            { id: 4, nombre: 'Ana Martínez', email: 'ana@example.com', rol: 'Admin', clave: '', estado: 'Activo' },
            { id: 5, nombre: 'Pedro Sánchez', email: 'pedro@example.com', rol: 'Usuario', clave: '', estado: 'Inactivo' },
        ]);
    }, []);

    const openNew = () => {
        setUsuario({
            id: null,
            nombre: '',
            email: '',
            rol: '',
            clave: '',
            estado: 'Activo'
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

    const saveUsuario = () => {
        setSubmitted(true);

        if (usuario.nombre.trim() && usuario.email.trim() && usuario.clave.trim()) {
            let _usuarios = [...usuarios];
            let _usuario = {...usuario};
            if (usuario.id) {
                const index = findIndexById(usuario.id);
                _usuarios[index] = _usuario;
                toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Usuario actualizado', life: 3000 });
            }
            else {
                _usuario.id = createId();
                _usuarios.push(_usuario);
                toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Usuario creado', life: 3000 });
            }

            setUsuarios(_usuarios);
            setUsuarioDialog(false);
            setUsuario(null);
        }
    };

    const editUsuario = (usuario) => {
        setUsuario({...usuario, clave: ''});
        setUsuarioDialog(true);
    };

    const confirmDeleteUsuario = (usuario) => {
        setUsuario(usuario);
        setDeleteUsuarioDialog(true);
    };

    const deleteUsuario = () => {
        let _usuarios = usuarios.filter(val => val.id !== usuario.id);
        setUsuarios(_usuarios);
        setDeleteUsuarioDialog(false);
        setUsuario(null);
        toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Usuario eliminado', life: 3000 });
    };

    const findIndexById = (id) => {
        let index = -1;
        for (let i = 0; i < usuarios.length; i++) {
            if (usuarios[i].id === id) {
                index = i;
                break;
            }
        }
        return index;
    };

    const createId = () => {
        let id = '';
        let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 5; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return id;
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
        const exportData = usuarios.map(({ clave, ...rest }) => Object.values(rest));
        doc.autoTable({
            head: [['ID', 'Nombre', 'Email', 'Rol', 'Estado']],
            body: exportData,
        });
        doc.save('usuarios.pdf');
    };

    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || '';
        let _usuario = {...usuario};
        _usuario[`${name}`] = val;
        setUsuario(_usuario);
    };

    const onEstadoChange = (e) => {
        let _usuario = {...usuario};
        _usuario.estado = e.value ? 'Activo' : 'Inactivo';
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
            <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
            <Button label="Guardar" icon="pi pi-check" className="p-button-text" onClick={saveUsuario} />
        </React.Fragment>
    );

    const deleteUsuarioDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteUsuarioDialog} />
            <Button label="Sí" icon="pi pi-check" className="p-button-text" onClick={deleteUsuario} />
        </React.Fragment>
    );

    return (
        <div className="datatable-crud-demo">
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
                    <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} exportable={false}></Column>
                    <Column field="nombre" header="Nombre" sortable style={{ minWidth: '16rem' }}></Column>
                    <Column field="email" header="Email" sortable style={{ minWidth: '20rem' }}></Column>
                    <Column field="rol" header="Rol" sortable style={{ minWidth: '10rem' }}></Column>
                    <Column field="estado" header="Estado" sortable style={{ minWidth: '8rem' }}></Column>
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
            >
                <div className="field">
                    <label htmlFor="nombre">Nombre</label>
                    <InputText 
                        id="nombre" 
                        value={usuario?.nombre} 
                        onChange={(e) => onInputChange(e, 'nombre')} 
                        required 
                        autoFocus 
                        className={classNames({ 'p-invalid': submitted && !usuario?.nombre })} 
                    />
                    {submitted && !usuario?.nombre && <small className="p-error">El nombre es requerido.</small>}
                </div>
                <div className="field">
                    <label htmlFor="email">Email</label>
                    <InputText 
                        id="email" 
                        value={usuario?.email} 
                        onChange={(e) => onInputChange(e, 'email')} 
                        required 
                        className={classNames({ 'p-invalid': submitted && !usuario?.email })} 
                    />
                    {submitted && !usuario?.email && <small className="p-error">El email es requerido.</small>}
                </div>
                <div className="field">
                    <label htmlFor="clave">Contraseña</label>
                    <Password
                        id="clave"
                        value={usuario?.clave}
                        onChange={(e) => onInputChange(e, 'clave')}
                        required
                        toggleMask
                        className={classNames({ 'p-invalid': submitted && !usuario?.clave })}
                        feedback={false}
                    />
                    {submitted && !usuario?.clave && <small className="p-error">La contraseña es requerida.</small>}
                </div>
                <div className="field">
                    <label htmlFor="rol">Rol</label>
                    <InputText 
                        id="rol" 
                        value={usuario?.rol} 
                        onChange={(e) => onInputChange(e, 'rol')} 
                    />
                </div>
                <div className="field">
                    <label htmlFor="estado">Estado</label>
                    <ToggleButton 
                        checked={usuario?.estado === 'Activo'} 
                        onChange={onEstadoChange} 
                        onLabel="Activo" 
                        offLabel="Inactivo" 
                        onIcon="pi pi-check" 
                        offIcon="pi pi-times" 
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
            >
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem'}} />
                    {usuario && <span>¿Está seguro de que desea eliminar a <b>{usuario.nombre}</b>?</span>}
                </div>
            </Dialog>
        </div>
    );
};

export default Usuarios;