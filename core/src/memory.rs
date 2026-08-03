use zeroize::Zeroize;

pub struct SecureBuffer {
    data: Vec<u8>,
}

impl SecureBuffer {
    pub fn new(data: Vec<u8>) -> Self {
        Self { data }
    }

    pub fn as_slice(&self) -> &[u8] {
        &self.data
    }
}

impl Drop for SecureBuffer {
    fn drop(&mut self) {
        self.data.zeroize();
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_secure_buffer_creation() {
        let secret = vec![1, 2, 3, 4, 5];
        let buf = SecureBuffer::new(secret.clone());
        assert_eq!(buf.as_slice(), secret.as_slice());
    }
}