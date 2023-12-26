package main

import (
	"bytes"
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/Azure/azure-sdk-for-go/sdk/azidentity"
	"github.com/Azure/azure-sdk-for-go/sdk/storage/azblob"
)

func handleRequest(w http.ResponseWriter, r *http.Request, storageClient *azblob.Client) {
	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	// Get the path and container name from the request
	// /api/files/{container}/{path}
	// Sanity check the path
	path := strings.TrimPrefix(r.URL.Path, "/api/files/")
	pathParts := strings.Split(path, "/")
	if len(pathParts) != 2 {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	container := pathParts[0]
	path = pathParts[1]

	ctx := context.Background()

	get, err := storageClient.DownloadStream(ctx, container, path, nil)

	if err != nil {
		if strings.Contains(err.Error(), "404") {
			w.WriteHeader(http.StatusNotFound)
			return
		}

		log.Fatal(err)
	}

	data := bytes.Buffer{}
	retryReader := get.NewRetryReader(ctx, &azblob.RetryReaderOptions{})
	_, err = data.ReadFrom(retryReader)
	if err != nil {
		log.Fatal(err)
	}

	// Serve the file
	w.Header().Set("Content-Type", "image/jpeg")
	w.Header().Set("Content-Length", fmt.Sprintf("%d", data.Len()))
	w.Write(data.Bytes())
}

func createStorageClient() (*azblob.Client, error) {
	storageAccountName := os.Getenv("STORAGE_ACCOUNT_NAME")
	if storageAccountName == "" {
		storageAccountName = "cloutsapidev"
	}

	url := fmt.Sprintf("https://%s.blob.core.windows.net/", storageAccountName)

	credential, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		return nil, err
	}

	client, err := azblob.NewClient(url, credential, nil)
	if err != nil {
		return nil, err
	}

	return client, nil
}

func main() {
	listenAddr := ":8080"
	if val, ok := os.LookupEnv("FUNCTIONS_CUSTOMHANDLER_PORT"); ok {
		listenAddr = ":" + val
	}

	storageClient, err := createStorageClient()
	if err != nil {
		log.Fatal(err)
	}

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		handleRequest(w, r, storageClient)
	})
	log.Printf("Listening on %s", listenAddr)
	log.Fatal(http.ListenAndServe(listenAddr, nil))
}
