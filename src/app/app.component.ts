import { Component, OnInit } from '@angular/core';
import { UploadService } from './upload.service';
import { DocumentService } from './document.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  step = 1;
  loading = false;
  progress = 0;

  apiResponse: any = null;
  docs: any[] = [];

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

  ngOnInit(): void {
    debugger
    const params = new URLSearchParams(window.location.search);
    let token = params.get('dmsRequest') || params.get('dmsrequest') || '';

    if (token) {
      try {
        if (token.includes('%25')) {
          token = decodeURIComponent(token);
        }
        token = token.trim();
      } catch (e) {
        console.warn('Could not decode token', e);
      }
      this.loadDocumentsByDmsRequest(token);
    } else {
      this.apiResponse = this.fallbackResponse;
      this.docs = this.mergeLists(this.apiResponse);
    }
  }

  loadDocumentsByDmsRequest(dmsRequest: string): void {
    this.loading = true;
    this.docService.postListOfDocument(dmsRequest).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.apiResponse = res;
        this.docs = this.mergeLists(this.apiResponse);
      },
      error: (err: any) => {
        this.loading = false;
        console.error('Failed to fetch documents', err);
        alert('Failed to load documents. Check console and backend.');
        this.apiResponse = this.fallbackResponse;
        this.docs = this.mergeLists(this.apiResponse);
      }
    });
  }

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

  onFileSelected(event: Event, doc: any): void {
    const input = event.target as HTMLInputElement;
    if (!input || !input.files || input.files.length === 0) {
      doc.fileObj = null;
      return;
    }
    doc.fileObj = input.files[0];
  }

  upload(doc: any): void {
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
      error: (err: any) => {
        this.loading = false;
        alert('Upload failed: ' + (err?.message || 'server error'));
      }
    });
  }

  clear(doc: any, fileInput?: HTMLInputElement): void {
    doc.fileObj = null;
    doc.uploadedFileName = null;
    doc.docUploaded = false;
    doc.docUrl = null;
    if (fileInput) fileInput.value = '';
  }

  view(doc: any): void {
    if (doc.docUrl) {
      const w = window.open('', '_blank');
      w!.document.write(`<p style="font-family:system-ui;padding:20px">Viewing: <strong>${doc.uploadedFileName || doc.docUrl}</strong></p>`);
      return;
    }
    alert('No document available to view for ' + (doc.catName || doc.catId));
  }

  proceed(): void {
    const missing = this.docs.filter(d => (d.mandatory === 'Y' || d.mandatory === 'y') && !d.docUploaded);
    if (missing.length) {
      alert('Please upload mandatory documents: ' + missing.map(m => m.catName || m.catId).join(', '));
      return;
    }
    this.step = 2;
  }

  submitAll(): void {
    const payload = this.docs.filter(d => d.docUploaded).map(d => ({
      catId: d.catId, subCatId: d.selectedSubCat, fileName: d.uploadedFileName, docUrl: d.docUrl
    }));
    console.log('Submit payload:', payload);
    alert('All documents submitted (simulation).');
  }
}
