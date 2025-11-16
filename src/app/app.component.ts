import { Component } from '@angular/core';
import { UploadService } from './upload.service';
import { DocumentService } from './document.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  step = 1;
  loading = false;
  progress = 0;

  apiResponse: any = null;
  docs: any[] = [];

  // fallback (used only if backend call fails or no token provided)
  private fallbackResponse: any = {
    response: {
      nonUploadedList: [],
      mandatoryList: [],
      applno: null,
      purposeName: null,
      regNo: null
    }
  };

  constructor(
    private uploadService: UploadService,
    private docService: DocumentService
  ) {}

  ngOnInit() {
    // 1) Read dmsRequest token from URL query string
    const params = new URLSearchParams(window.location.search);
    const token = params.get('dmsRequest') || params.get('dmsrequest');

    if (token) {
      // token may be percent-encoded in the URL; pass as-is (server expects encoded)
      console.log('Found dmsRequest in URL (raw):', token);
      this.loadDocumentsByDmsRequest(token);
    } else {
      // no token -> use fallback so UI still displays (dev)
      this.apiResponse = this.fallbackResponse;
      this.docs = this.mergeLists(this.apiResponse);
    }
  }

  loadDocumentsByDmsRequest(dmsRequest: string) {
    this.loading = true;
    this.docService.getListOfDocument(dmsRequest).subscribe({
      next: (res) => {
        this.loading = false;
        this.apiResponse = res;
        this.docs = this.mergeLists(this.apiResponse);
      },
      error: (err) => {
        this.loading = false;
        console.error('Failed to fetch documents', err);
        alert('Failed to load documents. Check console and backend.');
        // fallback so UI not blank
        this.apiResponse = this.fallbackResponse;
        this.docs = this.mergeLists(this.apiResponse);
      }
    });
  }

  // merge and prepare UI state (same helper as earlier)
  mergeLists(resp: any): any[] {
    const seen = new Set<string>();
    const arr: any[] = [];
    if (!resp || !resp.response) return arr;
    const add = (item: any) => {
      const key = item.catId || JSON.stringify(item);
      if (!seen.has(key)) {
        arr.push({
          ...item,
          fileObj: null,
          selectedSubCat: item.subcategoryMasterDataList?.[0]?.sub_cat_id || null,
          uploadedFileName: item.fileName || null,
          docUrl: item.docUrl || null,
          docUploaded: !!item.docUploaded
        });
        seen.add(key);
      }
    };
    (resp.response.mandatoryList || []).forEach(add);
    (resp.response.nonUploadedList || []).forEach(add);
    return arr;
  }

  onFileSelected(event: Event, doc: any) {
    const input = event.target as HTMLInputElement;
    if (!input || !input.files || input.files.length === 0) {
      doc.fileObj = null;
      return;
    }
    doc.fileObj = input.files[0];
  }

  upload(doc: any) {
    if (!doc.fileObj) {
      alert('Please select a file to upload for: ' + (doc.catName || doc.catId));
      return;
    }
    this.loading = true;
    this.progress = 0;
    this.uploadService.uploadFile(doc.fileObj, {
      catId: doc.catId,
      subCatId: doc.selectedSubCat,
      applNo: this.apiResponse?.response?.applno
    }).subscribe({
      next: (evt: any) => {
        if (evt.type === 'progress') {
          this.progress = evt.percent;
        } else if (evt.type === 'response') {
          this.loading = false;
          doc.docUploaded = true;
          doc.uploadedFileName = doc.fileObj.name;
          doc.docUrl = evt.body?.docUrl || evt.body?.path || ('uploaded://' + doc.uploadedFileName);
          this.progress = 100;
          setTimeout(() => (this.progress = 0), 400);
        }
      },
      error: (err) => {
        this.loading = false;
        alert('Upload failed: ' + (err?.message || 'server error'));
      }
    });
  }

  clear(doc: any, fileInput?: HTMLInputElement) {
    doc.fileObj = null;
    doc.uploadedFileName = null;
    doc.docUploaded = false;
    doc.docUrl = null;
    if (fileInput) fileInput.value = '';
  }

  view(doc: any) {
    if (doc.docUrl) {
      const w = window.open('', '_blank');
      w!.document.write(`<p style="font-family:system-ui;padding:20px">Viewing: <strong>${doc.uploadedFileName || doc.docUrl}</strong></p>`);
      return;
    }
    alert('No document available to view for ' + (doc.catName || doc.catId));
  }

  proceed() {
    const missing = this.docs.filter(d => (d.mandatory === 'Y' || d.mandatory === 'y') && !d.docUploaded);
    if (missing.length) {
      alert('Please upload mandatory documents: ' + missing.map(m => m.catName || m.catId).join(', '));
      return;
    }
    this.step = 2;
  }

  submitAll() {
    const payload = this.docs.filter(d => d.docUploaded).map(d => ({
      catId: d.catId, subCatId: d.selectedSubCat, fileName: d.uploadedFileName, docUrl: d.docUrl
    }));
    console.log('Submit payload:', payload);
    alert('All documents submitted (simulation).');
  }
}
