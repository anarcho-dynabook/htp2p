# HTP2P
Hypertext system on P2P network 

## Specification

### Request format
To access, server's multiaddr is needed. Request body is just 1 line and splitted by whitespace. first column is path of routing server privided, afters are arguements.
```
[path] [args...]
```

### Response format
Line 1 is stored by status code similar to HTTP. And after lines is free response body.
```line
[status code]
[response body]
```

## Screenshot in Testing

<img width="1054" height="497" alt="image" src="https://github.com/user-attachments/assets/3ee05e19-240a-4991-8eb7-9ea40d87de07" />


